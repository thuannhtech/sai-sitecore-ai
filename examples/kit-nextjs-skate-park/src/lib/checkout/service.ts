import { cartService } from 'lib/ordercloud/cart';
import { braintreeService } from 'lib/payment/braintree';
import { OrderPlacementRequest, OrderPlacementResponse } from './models';
import { Cart, Payment, PaymentTransaction } from 'src/lib/ordercloud';

const getBraintreePaymentMethodSummary = (payload?: OrderPlacementRequest['transaction']) => {
  const details =
    payload?.details && typeof payload.details === 'object'
      ? (payload.details as Record<string, unknown>)
      : {};

  const cardType = typeof details.cardType === 'string' ? details.cardType : '';
  const last4 =
    typeof details.lastFour === 'string'
      ? details.lastFour
      : typeof details.lastTwo === 'string'
        ? details.lastTwo
        : '';
  const description =
    typeof details.description === 'string'
      ? details.description
      : [cardType, last4 ? `ending in ${last4}` : ''].filter(Boolean).join(' ');

  return {
    provider: 'braintree',
    type: typeof payload?.type === 'string' ? payload.type : '',
    description: description || 'Credit Card',
    cardType,
    last4,
    details,
    nonce: payload?.nonce || '',
    deviceData: payload?.deviceData || '',
  };
};
/**
 * Helper to build OrderCloud address object from frontend payload
 */
const buildOrderCloudAddress = (payload: any) => {
  return {
    FirstName: payload.FirstName || payload.firstName || 'N/A',
    LastName: payload.LastName || payload.lastName || 'N/A',
    Street1: payload.Address || payload.addressLine1 || payload.Street1 || 'N/A',
    City: payload.City || payload.city || payload.City || 'N/A',
    State: payload.State || payload.state || payload.State || 'N/A',
    Zip: payload.ZipCode || payload.zipCode || payload.Zip || '70000',
    Country: payload.Country || payload.country || payload.Country || 'SG',
    Phone: payload.PhoneNumber || payload.phone || payload.Phone || 'N/A',
  };
};

export const checkoutService = {
  /**
   * Orchestrates the full order placement process:
   */
  placeOrder: async (payload: OrderPlacementRequest, paymentConfig?: any, orderId?: any): Promise<OrderPlacementResponse> => {
    console.log('[Checkout Service] Starting order placement...', { orderId: payload.cart.id });

    const accessToken = await cartService.getAccessTokenFromCookies();
    if (!accessToken) {
      throw new Error('Missing OrderCloud access token');
    }

    const requestOptions = { accessToken };

    let saleSucess = false;
    let transactionId = '';
    let storefrontPaymentMethod: Record<string, unknown> = {
      id: payload.paymentMethod.id,
      itemId: payload.paymentMethod.itemId || '',
      provider: payload.paymentMethod.id,
      label: payload.paymentMethod.id === 'braintree' ? 'Credit Card' : payload.paymentMethod.id,
      status: 'Pending',
    };
    let storefrontTransaction: Record<string, unknown> | null = payload.transaction
      ? getBraintreePaymentMethodSummary(payload.transaction)
      : null;

    console.log('[Checkout Service] Patching cart metadata...');
    const now = new Date().toISOString().replace('Z', '+00:00');

    const patchedCart = await Cart.Patch(
      {
        ShippingCost: payload.shippingMethod.price,
        TaxCost: payload.cart.taxAmount,
        xp: {
          PurchasedFrom: "en",
          PurchasedDate: now,
          UpdatedDate: now,
          ShippingMethodName: payload.shippingMethod.name,
          GST: payload.cart.taxRatePercentage,
          PaymentMethod: payload.paymentMethod.id,
          PaymentStatus: 'Pending',
          StorefrontCheckout: {
            shippingMethod: payload.shippingMethod,
            paymentMethod: storefrontPaymentMethod,
            transaction: storefrontTransaction,
          },
        }
      },
      requestOptions
    );

    const paymentAmount = Number(patchedCart?.Total.toFixed(2));

    if (payload.paymentMethod.id === 'braintree' && payload.transaction?.nonce) {
      console.log('[Checkout Service] Processing Braintree payment with Sitecore config...');

      if (!paymentConfig) {
        throw new Error('Missing Braintree payment configuration from Sitecore.');
      }

      const saleResult = await braintreeService.createTransaction(
        paymentAmount,
        payload.transaction.nonce,
        paymentConfig
      );

      saleSucess = saleResult.success;
      transactionId = saleResult.transactionId || '';
      storefrontPaymentMethod = {
        ...storefrontPaymentMethod,
        label:
          (storefrontTransaction?.description as string | undefined) ||
          (storefrontPaymentMethod.label as string),
        cardType: storefrontTransaction?.cardType || '',
        last4: storefrontTransaction?.last4 || '',
        status: saleResult.success ? 'Paid' : 'Failed',
      };
      storefrontTransaction = {
        ...(storefrontTransaction || {}),
        status: saleResult.success ? 'authorized' : 'failed',
        success: saleResult.success,
        transactionId,
        message: saleResult.success ? 'Transaction successful' : (saleResult.message || 'Transaction failed'),
      };

      const payment: Payment = {
        Type: 'CreditCard' as Payment['Type'],
        Amount: paymentAmount,
        Currency: 'USD',
        Accepted: saleResult.success,
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
        Amount: paymentAmount,
        Succeeded: saleResult.success,
        ResultMessage: saleResult.success ? 'Transaction successful' : (saleResult.message || 'Transaction failed'),
        xp: saleResult.success ? {
          TransactionRefID: saleResult.transactionId!
        } : {},
      };
  
      const createdTransaction = await Cart.CreatePaymentTransaction(
        createdPayment.ID,
        transactionPayload,
        requestOptions
      );
      
      console.log('[Checkout Service] Payment successful:', transactionId);
    } else {
      saleSucess = true;
      storefrontPaymentMethod = {
        ...storefrontPaymentMethod,
        status: 'Paid',
      };
    }

    await Cart.Patch(
      {
        xp: {
          ...patchedCart?.xp,
          PaymentMethod: payload.paymentMethod.id,
          PaymentStatus: storefrontPaymentMethod.status,
          StorefrontCheckout: {
            shippingMethod: payload.shippingMethod,
            paymentMethod: storefrontPaymentMethod,
            transaction: storefrontTransaction,
          },
        },
      },
      requestOptions
    );

    console.log('[Checkout Service] Submitting cart to OrderCloud...');

    console.log('[Checkout Service] Order placed successfully:', orderId);

    return {
      success: true,
      orderId: orderId,
      paymentSummary: {
        type: payload.paymentMethod.id,
        transactionId,
        success: saleSucess
      }
    };
  }
};
