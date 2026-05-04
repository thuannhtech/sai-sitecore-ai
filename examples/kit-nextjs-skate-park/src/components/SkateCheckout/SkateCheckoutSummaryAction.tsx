'use client';

import React from 'react';
import { SkateCartSummary } from '../SkateCart/SkateCartSummary';

export const SkateCheckoutSummaryAction = () => {
  const handlePlaceOrder = () => {
    console.log('Place Order');
    window.location.href = '/thank-you';
  };

  return (
    <SkateCartSummary
      isCheckout={true}
      onPlaceOrder={handlePlaceOrder}
    />
  );
};

export default SkateCheckoutSummaryAction;
