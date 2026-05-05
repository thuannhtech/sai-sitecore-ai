'use client';

import React, { useMemo, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { Check } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';
import { useSkateCheckoutStore } from 'src/lib/payment/store';
import { PaymentMethodConfig, SkateBraintreePayment } from './SkateBraintreePayment';

interface PaymentMethodFields {
  Enabled?: { value: boolean | string };
  MethodID?: { value: string };
  Title?: { value: string };
  Description?: { value: string };
  IconName?: { value: string };
  UseSandbox?: { value: boolean | string };
  MerchantID?: { value: string };
  PublicKey?: { value: string };
  PrivateKey?: { value: string };
  Sandbox_MerchantID?: { value: string };
  Sandbox_PublicKey?: { value: string };
  Sandbox_PrivateKey?: { value: string };
}

interface SkatePaymentMethodProps extends ComponentProps {
  fields: {
    items?: {
      fields: PaymentMethodFields;
      id: string;
      name: string;
    }[];
  };
}

export const SkatePaymentMethod: React.FC<SkatePaymentMethodProps> = (props) => {
  const { fields, params } = props;
  const styles = `${params?.GridParameters || ''} ${params?.styles || ''}`.trim();
  const { selectedMethodId, selectedMethodItemId, setSelectedMethodId } = useSkateCheckoutStore();

  // 1. Transform Sitecore Data to App Logic
  const paymentOptions = useMemo(() => {
    const rawItems = fields?.items || [];

    return rawItems
      .filter(item => {
        const val = item.fields?.Enabled?.value;
        return val === true || val === '1' || val === 'true';
      })
      .map(item => {
        const f = item.fields;
        const useSandboxVal = f.UseSandbox?.value;
        const isSandbox = useSandboxVal === true || useSandboxVal === '1' || useSandboxVal === 'true';

        const getVal = (baseName: string) => {
          const sandboxKey = `Sandbox_${baseName}` as keyof PaymentMethodFields;
          const prodKey = baseName as keyof PaymentMethodFields;
          return isSandbox ? (f[sandboxKey]?.value || f[prodKey]?.value) : f[prodKey]?.value;
        };

        const IconName = f.IconName?.value || 'CreditCard';
        const IconComponent = (Icons as any)[IconName] || Icons.CreditCard;

        return {
          id: f.MethodID?.value || item.id,
          sitecoreItemId: item.id, // Lưu lại ID để API có thể query ngược
          name: f.Title?.value || item.name,
          description: f.Description?.value || '',
          icon: <IconComponent size={24} />,
          config: {
            isSandbox,
            merchantId: getVal('MerchantID'),
            publicKey: getVal('PublicKey'),
            privateKey: getVal('PrivateKey'),
          }
        };
      });
  }, [fields]);

  const activeOption = useMemo(() =>
    paymentOptions.find(o => o.id === selectedMethodId),
    [paymentOptions, selectedMethodId]);

  // Sync active config to store - Removed setActiveConfig because we use selectedMethodItemId for backend config fetch
  useEffect(() => {
    // No-op or sync other metadata if needed
  }, [activeOption]);

  // 2. Fallback logic removed from React, handled by checkout.js for "Dumb UI" pattern
  if (paymentOptions.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
        No payment methods configured or enabled in Datasource.
      </div>
    );
  }

  return (
    <div className={`skate-payment-method py-4 ${styles}`} id="SkatePaymentMethodContainer">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentOptions.map((option) => {
          const isSelected = selectedMethodId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              data-method-id={option.id}
              data-item-id={option.sitecoreItemId}
              onClick={() => setSelectedMethodId(option.id, option.sitecoreItemId)}
              className={`payment-option-btn cursor-pointer relative flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left group ${isSelected
                ? 'border-blue-600 bg-blue-50/30'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50'
                }`}
            >
              <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
                }`}>
                {option.icon}
              </div>

              <div className="flex-1">
                <h4 className="font-black text-gray-900 uppercase tracking-tight mb-1">
                  {option.name}
                </h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400 font-medium leading-none">{option.description}</p>
                  {option.config.isSandbox && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 text-[8px] font-black uppercase rounded tracking-tighter">
                      Sandbox
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-1/2 -translate-y-1/2 right-6 text-blue-600">
                  <div className="bg-blue-600 rounded-full p-0.5 text-white shadow-lg shadow-blue-100">
                    <Check size={14} strokeWidth={4} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Credit Card Details Mockup */}
      {selectedMethodId === 'card' && (
        <div className="mt-6 p-8 bg-gray-900 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-600/30 transition-colors"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[2px]">Card Number</label>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-mono text-lg tracking-[4px]">
                **** **** **** 4242
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[2px]">Expiry</label>
                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-mono text-lg text-center">MM / YY</div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[2px]">CVV</label>
                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-mono text-lg text-center">***</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Braintree Payment Module */}
      {selectedMethodId === 'braintree' && activeOption && (
        <SkateBraintreePayment config={activeOption.config as PaymentMethodConfig} />
      )}
    </div>
  );
};

export default SkatePaymentMethod;
