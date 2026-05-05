'use client';

import React from 'react';
import { SkateCartSummary } from '../SkateCart/SkateCartSummary';
import { useSkateCheckoutStore } from 'src/lib/payment/store';
import { useSkateCartStore } from 'src/lib/cart/store';

/**
 * SkateCheckoutSummaryAction
 * Orchestrates the final checkout step by connecting the Summary UI 
 * with the selected Payment Method logic (e.g., Braintree).
 */
export const SkateCheckoutSummaryAction = () => {
  const {
    selectedMethodId,
    selectedMethodItemId,
    braintreeInstance,
    setIsProcessing,
    setError,
    isProcessing,
    shippingAddress,
    billingAddress,
    shippingMethod
  } = useSkateCheckoutStore();
  const { cart } = useSkateCartStore();

  const handlePlaceOrder = async () => {
    // 0. Validation Orchestrator
    if (!shippingAddress) {
      setError('Missing Shipping Address. Please fill and save it.');
      return;
    }

    if (!billingAddress) {
      setError('Missing Billing Address. Please confirm your billing info.');
      return;
    }

    if (!shippingMethod) {
      setError('Please select a Shipping Method.');
      return;
    }

    // 1. Handle Braintree Payment
    if (selectedMethodId === 'braintree') {
      if (!braintreeInstance) {
        setError('Payment interface (Braintree) is not ready. Please refresh.');
        return;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // A. Request Nonce from Drop-in UI
        const { nonce } = await braintreeInstance.requestPaymentMethod();

        // B. Submit Full Order to Server
        const response = await fetch('/api/checkout/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nonce,
            amount: (cart?.subtotal || 0) + (shippingMethod?.price || 0),
            datasourceId: selectedMethodItemId,
            shippingAddress,
            shippingMethod,
            billingAddress,
            items: cart?.items || []
          }),
        });

        const result = await response.json();

        if (result.success) {
          window.location.href = `/thank-you?oid=${result.orderId}&tid=${result.transactionId}`;
        } else {
          setError(`Order Failed: ${result.message}`);
        }
      } catch (err: any) {
        if (err.code === 'DROPIN_NO_PAYMENT_METHOD_SELECTED') {
          setError('Please select a payment method in the Braintree form.');
        } else {
          console.error('Checkout Error:', err);
          setError(err.message || 'An unexpected error occurred during payment.');
        }
      } finally {
        setIsProcessing(false);
      }
    } else if (!selectedMethodId) {
      setError('Please select a Payment Method.');
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
    />
  );
};

export default SkateCheckoutSummaryAction;
