import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import braintree from 'braintree';
import client from 'src/lib/sitecore-client';
import { Cart, Payment, PaymentTransaction } from 'src/lib/ordercloud';
import {
  CheckoutSubmitRequest,
  CheckoutSubmitRequestSchema,
  CheckoutSubmitResponse,
} from './models';
import { tokenHelper } from 'lib/ordercloud/token-helper';

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
    return {
      success: false,
      error: result.message || 'Braintree transaction failed.',
      transactionId: null,
      status: null,
    };
  }

  return {
    success: true,
    transactionId: result.transaction.id,
    status: result.transaction.status,
    error: null,
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

    console.log('Received checkout submit request:', payload);
    const accessToken = await tokenHelper.getValidToken();

    var order = await Cart.Get({ accessToken });

    console.log('Active order fetched for checkout submission:', order);

    if(order == null){
      const response: CheckoutSubmitResponse = {
        success: false,
        message: 'No active cart found for checkout.',
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const orderTotal = order?.Total || 0;

    if (!accessToken) {
      const response: CheckoutSubmitResponse = {
        success: false,
        message: 'Authentication required.',
      };
      return NextResponse.json(response, { status: 401 });
    }

    const requestOptions = { accessToken };

    const braintreeResult = await processBraintreePayment(payload, orderTotal);
    
    const payment: Payment = {
      Type: 'CreditCard' as Payment['Type'],
      Amount: orderTotal,
      Currency: 'USD',
      Accepted: braintreeResult.success,
      xp: {
        PaymentProvider: payload.paymentMethod.id,
        PaymentMethod: payload.paymentMethod.id,
      },
    };


    const createdPayment = await Cart.CreatePayment(payment, requestOptions);

    const transactionPayload: PaymentTransaction = {
      Type: 'Sale',
      DateExecuted: new Date().toISOString(),
      Currency: 'USD',
      Amount: orderTotal,
      Succeeded: braintreeResult.success,
      ResultCode: braintreeResult.success ? braintreeResult.status! : 'failed',
      ResultMessage: braintreeResult.success ? braintreeResult.transactionId! : braintreeResult.error!,
      xp: braintreeResult.success ? {
        TransactionRefID: braintreeResult.transactionId!
      } : {},
    };

    const createdTransaction = await Cart.CreatePaymentTransaction(
      createdPayment.ID,
      transactionPayload,
      requestOptions
    );

    const submittedOrder = await Cart.Submit(requestOptions);
    const orderId = submittedOrder.ID || '';
   

    const response: CheckoutSubmitResponse = {
      success: true,
      orderId,
      redirectUrl: `/thank-you?token=${orderId}`,
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
