import { cartService } from 'lib/ordercloud/cart';
import { braintreeService } from 'lib/payment/braintree';
import { OrderPlacementRequest, OrderPlacementResponse } from './models';
import { Cart, Payment, PaymentTransaction } from 'src/lib/ordercloud';
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
        }
      },
      requestOptions
    );

    const paymentAmount = Number(patchedCart?.Total.toFixed(2));

    let transactionId = '';
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
      
      transactionId = saleResult.transactionId || '';
      console.log('[Checkout Service] Payment successful:', transactionId);
    }


    // 3. Patch Cart Metadata (Gán XP theo chuẩn hệ thống để đồng bộ Workato)

    // 4. Chốt đơn (Submit Order)
    console.log('[Checkout Service] Submitting cart to OrderCloud...');

    console.log('[Checkout Service] Order placed successfully:', orderId);

    return {
      success: true,
      orderId: orderId,
      paymentSummary: {
        type: payload.paymentMethod.id,
        transactionId
      }
    };
  }
};
