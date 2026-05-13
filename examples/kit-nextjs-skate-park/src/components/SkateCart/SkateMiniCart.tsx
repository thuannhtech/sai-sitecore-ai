'use client';

import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useSkateCartStore } from 'src/lib/cart/store';
import Link from 'next/link';

export const SkateMiniCart: React.FC = () => {
  const { cart, isOpen, setIsOpen, fetchCart, updateQuantity, removeItem, isLoading } = useSkateCartStore();

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-all duration-300 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className={`relative h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            {cart && cart.itemCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                {cart.itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!cart || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-full bg-gray-50 p-6">
                <ShoppingCart className="h-12 w-12 text-gray-200" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
              <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 rounded-full bg-blue-600 px-8 py-3 font-bold text-white transition-colors hover:bg-blue-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-30 w-30 shrink-0 overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-[15px] font-medium text-center leading-tight">No Image</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1 text-[20px]">
                    <div>
                      <div className="flex justify-between gap-2">
                        <p className="font-bold text-gray-900 line-clamp-1 text-[15px]">{item.name}</p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-8 w-8" />
                        </button>
                      </div>
                      <p className="mt-1 text-md font-bold text-blue-600">
                        ${item.unitPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-lg border border-gray-200 p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-gray-900"
                        >
                          <Minus className="h-6 w-6" />
                        </button>
                        <span className="w-8 text-center text-[14px] font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-gray-900"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      </div>
                      <span className="font-bold text-gray-900">
                        ${item.lineTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t bg-gray-50 px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-2xl font-black text-gray-900">${cart.subtotal.toLocaleString()}</span>
            </div>
            <div className="grid gap-3">

              <Link
                style={{ color: '#fff' }}
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl bg-blue-600 py-4 font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
              >
                VIEW CART
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-2xl border-2 border-gray-200 py-4 font-bold text-gray-600 transition-colors hover:bg-white hover:border-gray-300"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
