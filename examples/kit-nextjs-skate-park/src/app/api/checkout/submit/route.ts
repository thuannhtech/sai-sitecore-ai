import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import braintree from 'braintree';
import client from 'src/lib/sitecore-client';
import { Cart } from 'src/lib/ordercloud';
import {
  CheckoutSubmitRequest,
  CheckoutSubmitRequestSchema,
  CheckoutSubmitResponse,
} from './models';

const GET_PAYMENT_CONFIG = `
  query GetPaymentConfig($path: String!) {
    item(path: $path, language: "en") {
      useSandbox: field(name: "UseSandbox") { value }
      merchantId: field(name: "MerchantID") { value }
      publicKey: field(name: "PublicKey") { value }
      privateKey: field(name: "PrivateKey") { value }
      sandbox_merchantId: field(name: "Sandbox_MerchantID") { value }
      sandbox_publicKey: field(name: "Sandbox_PublicKey") { value }
      sandbox_privateKey: field(name: "Sandbox_PrivateKey") { value }
    }
  }
`;

type SitecorePaymentConfigResponse = {
  item?: {
    useSandbox?: { value?: string };
    merchantId?: { value?: string };
    publicKey?: { value?: string };
    privateKey?: { value?: string };
    sandbox_merchantId?: { value?: string };
    sandbox_publicKey?: { value?: string };
    sandbox_privateKey?: { value?: string };
  } | null;
};

const buildOrderCloudAddress = (address: CheckoutSubmitRequest['shippingAddress']) => ({
  FirstName: address.FirstName,
  LastName: address.LastName,
  Street1: address.Address,
  City: address.City || 'N/A',
  State: address.State || undefined,
  Zip: address.Zip || undefined,
  Country: address.Country || 'US',
  Phone: address.PhoneNumber,
  AddressName: `${address.FirstName} ${address.LastName}`.trim(),
  xp: {
    Email: address.Email,
  },
});

const normalizeOrderCloudError = (error: any) => {
  return (
    error?.response?.data?.Errors?.[0]?.Message ||
    error?.response?.data?.error_description ||
    error?.message ||
    'Checkout submission failed'
  );
};

const processBraintreePayment = async (
  payload: CheckoutSubmitRequest,
  amount: number
) => {
  if (!payload.transaction?.nonce) {
    throw new Error('Missing Braintree nonce.');
  }

  if (!payload.paymentMethod.itemId) {
    throw new Error('Missing payment datasource ID.');
  }

  const data = await client.getData<SitecorePaymentConfigResponse>(GET_PAYMENT_CONFIG, {
    path: payload.paymentMethod.itemId,
  });
  const item = data?.item;

  if (!item) {
    throw new Error('Payment config not found in Sitecore.');
  }

  const isSandbox = item.useSandbox?.value === '1' || item.useSandbox?.value === 'true';
  const gateway = new braintree.BraintreeGateway({
    environment: isSandbox ? braintree.Environment.Sandbox : braintree.Environment.Production,
    merchantId: isSandbox
      ? item.sandbox_merchantId?.value || item.merchantId?.value || ''
      : item.merchantId?.value || '',
    publicKey: isSandbox
      ? item.sandbox_publicKey?.value || item.publicKey?.value || ''
      : item.publicKey?.value || '',
    privateKey: isSandbox
      ? item.sandbox_privateKey?.value || item.privateKey?.value || ''
      : item.privateKey?.value || '',
  });

  const result = await gateway.transaction.sale({
    amount: amount.toFixed(2),
    paymentMethodNonce: payload.transaction.nonce,
    deviceData: payload.transaction.deviceData,
    options: {
      submitForSettlement: true,
    },
  });

  if (!result.success) {
    throw new Error(result.message || 'Braintree transaction failed.');
  }

  return {
    transactionId: result.transaction.id,
    status: result.transaction.status,
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CheckoutSubmitRequestSchema.safeParse(body);

    if (!parsed.success) {
      const response: CheckoutSubmitResponse = {
        success: false,
        message: 'Invalid checkout payload.',
        details: parsed.error.flatten(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const payload = parsed.data;
    const accessToken = await tokenHelper.getValidToken();

    if (!accessToken) {
      const response: CheckoutSubmitResponse = {
        success: false,
        message: 'Authentication required.',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const requestOptions = { accessToken };

    try {
      await Cart.Delete(requestOptions);
    } catch {
      // Ignore missing/empty cart errors and rebuild from the payload.
    }

    await Cart.PatchFromUser(
      {
        FirstName: payload.shippingAddress.FirstName,
        LastName: payload.shippingAddress.LastName,
        Email: payload.shippingAddress.Email,
      },
      requestOptions
    );

    for (const item of payload.cart.items) {
      await Cart.CreateLineItem(
        {
          ProductID: item.productId,
          Quantity: item.quantity,
          xp: {
            sourceLineItemId: item.id,
            imageUrl: item.imageUrl,
            requestedUnitPrice: item.unitPrice,
            requestedLineTotal: item.lineTotal,
          },
        },
        requestOptions
      );
    }

    await Cart.SetShippingAddress(buildOrderCloudAddress(payload.shippingAddress), requestOptions);
    await Cart.SetBillingAddress(buildOrderCloudAddress(payload.billingAddress), requestOptions);

    await Cart.Patch(
      {
        Comments: `Submitted from storefront on ${payload.orderDate}`,
        ShippingCost: payload.shippingMethod.price,
        xp: {
          storefrontCheckout: {
            sourceOrderId: payload.orderId,
            orderDate: payload.orderDate,
            shippingMethod: payload.shippingMethod,
            paymentMethod: payload.paymentMethod,
            cart: {
              sourceCartId: payload.cart.id,
              requestedSubtotal: payload.cart.subtotal,
              requestedItemCount: payload.cart.itemCount,
            },
          },
        },
      },
      requestOptions
    );

    const worksheet = await Cart.Calculate(requestOptions);
    const orderTotal = Number(worksheet?.Order?.Total || payload.cart.subtotal + payload.shippingMethod.price);

    let paymentSummary: {
      id?: string;
      type?: string;
      accepted?: boolean;
      transactionId?: string;
      status?: string;
    } = {
      type: payload.paymentMethod.id === 'braintree' ? 'CreditCard' : 'PurchaseOrder',
      accepted: true,
    };

    if (payload.paymentMethod.id === 'braintree') {
      const braintreeResult = await processBraintreePayment(payload, orderTotal);
      const payment = await Cart.CreatePayment(
        {
          Type: 'CreditCard',
          Amount: orderTotal,
          Accepted: true,
          Description: 'Braintree payment',
          xp: {
            provider: 'braintree',
            methodId: payload.paymentMethod.id,
            datasourceId: payload.paymentMethod.itemId,
            storefrontPayload: {
              type: payload.transaction?.type,
              description: payload.transaction?.description,
            },
          },
        },
        requestOptions
      );

      if (payment.ID) {
        await Cart.CreatePaymentTransaction(
          payment.ID,
          {
            Type: 'Sale',
            Amount: orderTotal,
            Succeeded: true,
            ResultCode: braintreeResult.status,
            ResultMessage: braintreeResult.transactionId,
            xp: {
              provider: 'braintree',
              transaction: payload.transaction,
            },
          },
          requestOptions
        );
      }

      paymentSummary = {
        id: payment.ID,
        type: payment.Type,
        accepted: payment.Accepted,
        transactionId: braintreeResult.transactionId,
        status: braintreeResult.status,
      };
    } else {
      const payment = await Cart.CreatePayment(
        {
          Type: 'PurchaseOrder',
          Amount: orderTotal,
          Accepted: true,
          Description: payload.paymentMethod.id,
          xp: {
            provider: 'storefront',
            methodId: payload.paymentMethod.id,
          },
        },
        requestOptions
      );

      paymentSummary = {
        id: payment.ID,
        type: payment.Type,
        accepted: payment.Accepted,
      };
    }

    const submittedOrder = await Cart.Submit(requestOptions);
    const orderId = submittedOrder.ID || '';
    const submittedAt = new Date().toISOString();
    const orderSnapshot = {
      ...payload,
      orderId,
      sourceOrderId: payload.orderId,
      orderCloudOrderId: orderId,
      submittedAt,
      status: submittedOrder.Status,
      totals: {
        subtotal: submittedOrder.Subtotal,
        shipping: submittedOrder.ShippingCost,
        tax: submittedOrder.TaxCost,
        total: submittedOrder.Total,
      },
      payment: paymentSummary,
    };

    const response: CheckoutSubmitResponse = {
      success: true,
      orderId,
      redirectUrl: `/thank-you?token=${orderId}`,
      order: orderSnapshot,
      orderCloud: {
        orderId,
        status: submittedOrder.Status,
        total: submittedOrder.Total,
        subtotal: submittedOrder.Subtotal,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[API Checkout Submit Error]', error);

    const response: CheckoutSubmitResponse = {
      success: false,
      message: normalizeOrderCloudError(error),
    };

    return NextResponse.json(response, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed.' },
    { status: 405 }
  );
}
