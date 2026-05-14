import { Cart } from 'lib/ordercloud';
import { cartService } from 'lib/ordercloud/cart';
import { braintreeService } from 'lib/payment/braintree';
import { OrderPlacementRequest, OrderPlacementResponse } from './models';

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
  placeOrder: async (payload: OrderPlacementRequest, paymentConfig?: any): Promise<OrderPlacementResponse> => {
    console.log('[Checkout Service] Starting order placement...', { orderId: payload.cart.id });

    const accessToken = await cartService.getAccessTokenFromCookies();
    if (!accessToken) {
      throw new Error('Missing OrderCloud access token');
    }

    const requestOptions = { accessToken };

    // 1. Xử lý thanh toán Braintree (Sử dụng config từ Sitecore truyền vào)
    let transactionId = '';
    if (payload.paymentMethod.id === 'braintree' && payload.transaction?.nonce) {
      console.log('[Checkout Service] Processing Braintree payment with Sitecore config...');

      if (!paymentConfig) {
        throw new Error('Missing Braintree payment configuration from Sitecore.');
      }

      const saleResult = await braintreeService.createTransaction(
        payload.cart.subtotal,
        payload.transaction.nonce,
        paymentConfig
      );

      if (!saleResult.success) {
        throw new Error(`Payment failed: ${saleResult.message}`);
      }
      transactionId = saleResult.transactionId || '';
      console.log('[Checkout Service] Payment successful:', transactionId);
    }

    // 2. Cập nhật Địa chỉ
    console.log('[Checkout Service] Updating addresses...');
    const shippingAddress = buildOrderCloudAddress(payload.shippingAddress);
    const billingAddress = buildOrderCloudAddress(payload.billingAddress);

    await Cart.SetShippingAddress(shippingAddress, requestOptions);
    await Cart.SetBillingAddress(billingAddress, requestOptions);

    // 3. Patch Cart Metadata (Gán XP theo chuẩn hệ thống để đồng bộ Workato)
    console.log('[Checkout Service] Patching cart metadata...');
    const now = new Date().toISOString().replace('Z', '+00:00');

    await Cart.Patch(
      {
        ShippingCost: payload.shippingMethod.price,
        xp: {
          SubStatus: "Processing",
          PaymentStatus: "PAID",
          PurchasedFrom: "en",
          PurchasedDate: now,
          UpdatedDate: now,
          CustomerMessage: "Placed via Storefront",
          // Lưu toàn bộ request payload vào đây theo yêu cầu của anh
          storefrontCheckout: payload,
          ShippingMethodName: payload.shippingMethod.name,
          PaymentMethod: payload.paymentMethod.id === 'braintree' ? 'Credit Card' : payload.paymentMethod.id,
          shippingAddress: shippingAddress,
          billingAddress: billingAddress
        }
      },
      requestOptions
    );

    // 4. Chốt đơn (Submit Order)
    console.log('[Checkout Service] Submitting cart to OrderCloud...');
    const submittedOrder = await Cart.Submit(requestOptions);

    console.log('[Checkout Service] Order placed successfully:', submittedOrder.ID);

    return {
      success: true,
      orderId: submittedOrder.ID,
      submittedOrder,
      paymentSummary: {
        type: payload.paymentMethod.id,
        transactionId
      }
    };
  }
};
