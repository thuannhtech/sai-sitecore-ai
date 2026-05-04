'use client';

import React from 'react';
import { SkateCartSummary } from '../SkateCart/SkateCartSummary';
import { useSkatePaymentStore } from 'src/lib/payment/store';
import { useSkateCartStore } from 'src/lib/cart/store';

/**
 * SkateCheckoutSummaryAction
 * Orchestrates the final checkout step by connecting the Summary UI 
 * with the selected Payment Method logic (e.g., Braintree).
 */
export const SkateCheckoutSummaryAction = () => {
  const { selectedMethodId, selectedMethodItemId, braintreeInstance, setIsProcessing, setError, isProcessing } = useSkatePaymentStore();
  const { cart } = useSkateCartStore();

  const handlePlaceOrder = async () => {
    // 1. Handle Braintree Payment
    if (selectedMethodId === 'braintree') {
      if (!braintreeInstance) {
        alert('Giao diện thanh toán Braintree chưa sẵn sàng.');
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // A. Request Nonce from Drop-in UI
        const { nonce } = await braintreeInstance.requestPaymentMethod();

        // B. Send Nonce + Datasource ID to Server API (Bảo mật tuyệt đối)
        const response = await fetch('/api/checkout/braintree', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nonce,
            amount: cart?.subtotal || 0,
            datasourceId: selectedMethodItemId, // Chỉ gửi ID
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Success navigation
          window.location.href = `/thank-you?tid=${result.transactionId}`;
        } else {
          setError(result.message);
          alert(`Thanh toán thất bại: ${result.message}`);
        }
      } catch (err: any) {
        // Handle user cancellation or Braintree errors
        if (err.code !== 'DROPIN_NO_PAYMENT_METHOD_SELECTED') {
          console.error('Braintree Payment Error:', err);
          setError(err.message);
          alert(`Lỗi: ${err.message}`);
        }
      } finally {
        setIsProcessing(false);
      }
    }
    // 2. Handle Other Methods (Card Mock, COD, MoMo Mock)
    else {
      setIsProcessing(true);
      console.log('Processing order for method:', selectedMethodId);

      // Simulate API call
      setTimeout(() => {
        window.location.href = '/thank-you';
      }, 1500);
    }
  };

  return (
    <SkateCartSummary
      isCheckout={true}
      onPlaceOrder={handlePlaceOrder}
      isLoading={isProcessing}
    />
  );
};

export default SkateCheckoutSummaryAction;
