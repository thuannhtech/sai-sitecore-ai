'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSkateCartStore } from 'src/lib/cart/store';

export const SkateCartToggle: React.FC = () => {
  const { setIsOpen, cart } = useSkateCartStore();

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-[8px] cursor-pointer transition-opacity duration-200 hover:opacity-80 group"
    >
      <div className="relative flex items-center">
        <ShoppingCart size={20} className="text-white" strokeWidth={2} />
        {cart && cart.itemCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#ff4d4f] text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
            {cart.itemCount}
          </span>
        )}
      </div>
      <span className="text-[14px] font-normal text-white">Cart</span>
    </button>
  );
};
