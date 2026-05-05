'use client';

import React, { useState } from 'react';
import { Truck, Zap, Package, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSkateCheckoutStore } from 'src/lib/payment/store';
import { ComponentProps } from 'lib/component-props';

const METHODS = [
  { id: 'standard', name: 'Standard Delivery', price: 0, time: '3-5 business days', icon: Package },
  { id: 'express', name: 'Express Shipping', price: 15, time: '1-2 business days', icon: Truck },
  { id: 'priority', name: 'Priority Overnight', price: 35, time: 'Next business day', icon: Zap },
];

interface ShippingMethodFormProps extends ComponentProps {
  fields: any;
}

export const Default = (props: ShippingMethodFormProps) => {
  const { setShippingMethod, setStep, shippingMethod, setError } = useSkateCheckoutStore();
  const [selectedId, setSelectedId] = useState<string | null>(shippingMethod?.id || null);
  const [isSaved, setIsSaved] = useState(!!shippingMethod);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedId) {
      setLocalError('Please select a shipping method before continuing.');
      return;
    }

    const method = METHODS.find(m => m.id === selectedId);
    if (method) {
      setShippingMethod({ id: method.id, name: method.name, price: method.price });
      setIsSaved(true);
      setLocalError(null);
      setError(null);
      setStep(4); // Sang bước 4: Payment
    }
  };

  // Chế độ View (Đã lưu)
  if (isSaved && shippingMethod) {
    const methodInfo = METHODS.find(m => m.id === shippingMethod.id);
    return (
      <div className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="flex justify-between items-center bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
               <CheckCircle2 size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 uppercase">{shippingMethod.name}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {methodInfo?.time} • {shippingMethod.price === 0 ? 'FREE' : `$${shippingMethod.price}`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsSaved(false)}
            className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
          >
            <Edit2 size={12} />
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shipping-method-form space-y-6 animate-in fade-in duration-500">
      
      {localError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in shake duration-300">
          <AlertCircle size={18} />
          <p className="text-xs font-bold uppercase tracking-tight">{localError}</p>
        </div>
      )}

      <div className="space-y-4">
        {METHODS.map((method) => {
          const isSelected = selectedId === method.id;
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => { setSelectedId(method.id); setLocalError(null); }}
              className={`w-full flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-gray-50 hover:border-gray-200 bg-white'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 uppercase text-sm tracking-tight">{method.name}</h4>
                <p className="text-xs text-gray-400">{method.time}</p>
              </div>
              <div className="text-right font-black text-gray-900">
                {method.price === 0 ? 'FREE' : `$${method.price}`}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-50">
        <button
          onClick={handleContinue}
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all"
        >
          Confirm Method
        </button>
      </div>
    </div>
  );
};

export default Default;
