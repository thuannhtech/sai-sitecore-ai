'use client';

import React, { useMemo } from 'react';
import * as Icons from 'lucide-react'; 
import { Check } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';
import { useSkatePaymentStore } from 'src/lib/payment/store';
import { SkateBraintreePayment } from './SkateBraintreePayment';

interface PaymentMethodFields {
  Enabled?: { value: boolean | string };
  MethodID?: { value: string };
  Title?: { value: string };
  Description?: { value: string };
  IconName?: { value: string };
  UseSandbox?: { value: boolean | string };
  // Config fields
  MerchantID?: { value: string };
  PublicKey?: { value: string };
  Sandbox_MerchantID?: { value: string };
  Sandbox_PublicKey?: { value: string };
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
  const { selectedMethodId, setSelectedMethodId } = useSkatePaymentStore();

  // 1. Transform Sitecore Data to App Logic
  const paymentOptions = useMemo(() => {
    // Support both Content Resolver (items array) and Integrated GraphQL
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
        
        // Helper to pick sandbox or prod value based on prefix requirement
        const getVal = (baseName: string) => {
          const sandboxKey = `Sandbox_${baseName}` as keyof PaymentMethodFields;
          const prodKey = baseName as keyof PaymentMethodFields;
          return isSandbox ? (f[sandboxKey]?.value || f[prodKey]?.value) : f[prodKey]?.value;
        };

        // Dynamic Icon mapping from lucide-react
        const IconName = f.IconName?.value || 'CreditCard';
        const IconComponent = (Icons as any)[IconName] || Icons.CreditCard;

        return {
          id: f.MethodID?.value || item.id,
          name: f.Title?.value || item.name,
          description: f.Description?.value || '',
          icon: <IconComponent size={24} />,
          config: {
            isSandbox,
            merchantId: getVal('MerchantID'),
            publicKey: getVal('PublicKey'),
          }
        };
      });
  }, [fields]);

  if (paymentOptions.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
        No payment methods configured or enabled in Datasource.
      </div>
    );
  }

  const activeOption = paymentOptions.find(o => o.id === selectedMethodId);

  return (
    <div className={`skate-payment-method py-4 ${styles}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentOptions.map((option) => {
          const isSelected = selectedMethodId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedMethodId(option.id)}
              className={`relative flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left group ${
                selectedMethodId === option.id 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50'
              }`}
            >
              <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                selectedMethodId === option.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
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

              {selectedMethodId === option.id && (
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

      {/* Credit Card Details Mockup (Show only if card selected) */}
      {selectedMethodId === 'card' && (
        <div className="mt-6 p-8 bg-gray-900 rounded-2xl shadow-2xl relative overflow-hidden group">
          {/* Decorative elements for the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-600/30 transition-colors"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[2px]">Card Number</label>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-[4px]">
                **** **** **** 4242
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[2px]">Expiry</label>
                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-lg text-center">
                  MM / YY
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[2px]">CVV</label>
                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-lg text-center">
                  ***
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-end relative z-10">
            <div className="text-white/40 font-mono text-xs uppercase tracking-widest">Skater Preferred Member</div>
            <div className="flex gap-2">
              <div className="w-8 h-5 bg-red-500/50 rounded-sm"></div>
              <div className="w-8 h-5 bg-yellow-500/50 rounded-sm -ml-4"></div>
            </div>
          </div>
        </div>
      )}

      {/* Braintree Payment Module */}
      {selectedMethodId === 'braintree' && activeOption && (
         <SkateBraintreePayment config={activeOption.config} />
      )}
    </div>
  );
};

export default SkatePaymentMethod;
