'use client';

import React, { useState } from 'react';
import { CreditCard, Wallet, Landmark, HandCoins, Check } from 'lucide-react';

const PAYMENT_OPTIONS = [
  {
    id: 'card',
    name: 'Credit Card',
    icon: <CreditCard size={24} />,
    description: 'Visa, Mastercard, AMEX'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: <Wallet size={24} />,
    description: 'Safe payment with PayPal'
  },
  {
    id: 'momo',
    name: 'MoMo / E-Wallet',
    icon: <Landmark size={24} />,
    description: 'Scan to pay instantly'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: <HandCoins size={24} />,
    description: 'Pay when you receive'
  }
];

export const SkatePaymentMethod: React.FC = () => {
  const [selectedId, setSelectedId] = useState('card');

  return (
    <div className="skate-payment-method py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelectedId(option.id)}
              className={`relative flex items-center gap-6 p-6 rounded-2xl border-2 transition-all text-left group ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/30' 
                  : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/50'
              }`}
            >
              <div className={`shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'
              }`}>
                {option.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="font-black text-gray-900 uppercase tracking-tight mb-1">
                  {option.name}
                </h4>
                <p className="text-xs text-gray-400 font-medium leading-none">{option.description}</p>
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

      {/* Credit Card Details Mockup (Show only if card selected) */}
      {selectedId === 'card' && (
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
    </div>
  );
};

export default SkatePaymentMethod;
