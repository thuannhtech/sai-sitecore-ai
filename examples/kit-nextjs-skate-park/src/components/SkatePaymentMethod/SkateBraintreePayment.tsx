'use client';

import React, { useEffect, useRef } from 'react';
import dropin from 'braintree-web-drop-in';
import { useSkatePaymentStore } from 'src/lib/payment/store';

export type PaymentMethodConfig = {
  isSandbox: boolean;
  merchantId?: string;
  publicKey?: string;
};

interface SkateBraintreePaymentProps {
  config: PaymentMethodConfig;
}

/**
 * SkateBraintreePayment Module
 * Handles the lifecycle of Braintree Drop-in UI.
 */
export const SkateBraintreePayment: React.FC<SkateBraintreePaymentProps> = ({ config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { braintreeInstance, error, setError, setBraintreeInstance, selectedMethodItemId } = useSkatePaymentStore();

  useEffect(() => {
    // [Race Condition Fix] Đợi cho đến khi có ID từ Sitecore mới gọi API lấy Token
    if (!selectedMethodItemId) {
      console.log('Braintree: Waiting for Sitecore Item ID...');
      return;
    }

    let instance: any;
    let isDestroyed = false;

    const initializeDropin = async () => {
      if (!containerRef.current) return;

      // [Braintree Fix] Đảm bảo DOM trống trước khi khởi tạo
      containerRef.current.innerHTML = '';

      try {
        setError(null);
        console.log('Braintree: Requesting dynamic Client Token for datasource:', selectedMethodItemId);

        // A. Gọi API lấy Token
        const tokenResponse = await fetch('/api/checkout/braintree/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datasourceId: selectedMethodItemId })
        });

        const tokenData = await tokenResponse.json();

        if (isDestroyed) return; // Nếu component đã unmount thì dừng lại

        if (!tokenData.success) {
          throw new Error(tokenData.message || 'Không thể lấy Client Token');
        }

        const authorization = tokenData.clientToken;
        console.log('Braintree: Received Client Token, initializing Drop-in...');

        // B. Khởi tạo Drop-in UI
        instance = await dropin.create({
          authorization,
          container: containerRef.current,
          card: {
            cardholderName: { required: true }
          },
          paypal: { flow: 'vault' }
        });

        if (isDestroyed) {
          instance.teardown();
          return;
        }

        console.log('Braintree: Instance created successfully (Dynamic Flow)');
        setBraintreeInstance(instance);
      } catch (err: any) {
        if (!isDestroyed) {
          console.error('Braintree Error:', err);
          setError(`Lỗi thanh toán: ${err.message}`);
        }
      }
    };

    initializeDropin();

    return () => {
      isDestroyed = true;
      if (instance) {
        console.log('Braintree: Cleaning up instance');
        instance.teardown().catch((e: any) => console.error('Braintree teardown error:', e));
        setBraintreeInstance(null);
      }
    };
  }, [setBraintreeInstance, setError, selectedMethodItemId]);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative min-h-[150px]">
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
          <p className="text-red-600 text-xs font-bold leading-relaxed">{error}</p>
        </div>
      )}
      <div ref={containerRef} id="braintree-dropin-container" />
      {!error && !braintreeInstance && (
        <div className="flex flex-col items-center justify-center py-10 animate-pulse">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading...</p>
        </div>
      )}
      <p className="text-[10px] text-gray-400 mt-4 text-center uppercase tracking-widest font-bold">
        Secure payment processed by Braintree
      </p>
    </div>
  );
};

export default SkateBraintreePayment;
