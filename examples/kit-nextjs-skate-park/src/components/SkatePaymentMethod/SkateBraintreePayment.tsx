'use client';

import React, { useEffect, useRef } from 'react';
import dropin from 'braintree-web-drop-in';
import { useSkatePaymentStore } from 'src/lib/payment/store';

interface SkateBraintreePaymentProps {
  config: {
    isSandbox: boolean;
    merchantId?: string;
    publicKey?: string;
  };
}

/**
 * SkateBraintreePayment Module
 * Handles the lifecycle of Braintree Drop-in UI.
 */
export const SkateBraintreePayment: React.FC<SkateBraintreePaymentProps> = ({ config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setBraintreeInstance, setError } = useSkatePaymentStore();

  useEffect(() => {
    let instance: any;

    const initializeDropin = async () => {
      if (!containerRef.current) return;

      try {
        // [POC Note] Authorization can be a Tokenization Key or a Client Token from Server.
        // For demonstration, we use a sandbox pattern if config is provided.
        const authorization = 'sandbox_8n47g625_2n8p9m6q9m7y7y7y'; // Demo key

        instance = await dropin.create({
          authorization,
          container: containerRef.current,
          card: {
            cardholderName: {
              required: true
            }
          },
          paypal: {
            flow: 'vault'
          }
        });

        setBraintreeInstance(instance);
      } catch (err: any) {
        console.error('Braintree initialization failed:', err);
        setError('Không thể khởi tạo giao diện thanh toán Braintree. Vui lòng thử lại.');
      }
    };

    initializeDropin();

    return () => {
      if (instance) {
        instance.teardown().catch((e: any) => console.error('Braintree teardown error:', e));
        setBraintreeInstance(null);
      }
    };
  }, [setBraintreeInstance, setError, config]);

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div ref={containerRef} id="braintree-dropin-container" className="min-h-[300px]" />
      <p className="text-[10px] text-gray-400 mt-4 text-center uppercase tracking-widest font-bold">
        Secure payment processed by Braintree
      </p>
    </div>
  );
};

export default SkateBraintreePayment;
