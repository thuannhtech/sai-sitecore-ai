'use client';

import React from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useSkateCartStore } from 'src/lib/cart/store';
import { Link } from 'src/i18n/navigation';

export const SkateCartItemList: React.FC = () => {
  const { cart, updateQuantity, removeItem, isLoading } = useSkateCartStore();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 shadow-sm text-center h-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-50/50 rounded-full -ml-32 -mb-32 blur-3xl"></div>

        <div className="relative">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-50 mb-8 relative">
            <ShoppingCart className="w-16 h-16 text-blue-600/20" />
            <div className="absolute inset-0 border-2 border-blue-600/10 rounded-full animate-ping scale-75"></div>
          </div>

          <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight uppercase">
            Your cart is <span className="text-blue-600">empty</span>
          </h2>
          <p className="text-gray-400 mb-12 max-w-lg mx-auto font-medium text-lg leading-relaxed">
            Dont miss out on the latest boards and gear. Start exploring our premium skate collection today and find your perfect ride!
          </p>

          <Link
            href="/"
            className="mt-10 group relative inline-flex items-center justify-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-xl rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)] hover:-translate-y-1 active:scale-95"
          >
            {/* Glossy Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative flex items-center gap-3">
              <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform duration-300 text-white" />
              <span className="tracking-widest text-white">CONTINUE SHOPPING</span>
            </div>

            {/* Bottom Shine */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Header (Desktop) */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-6 bg-gray-50 border-b border-gray-100 text-[15px] font-bold text-gray-500 uppercase tracking-wider">
        <div className="col-span-6">Product</div>
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-100">
        {cart.items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center px-8 py-8 hover:bg-gray-50 transition-colors group">
            {/* Product Info */}
            <div className="col-span-1 md:col-span-6 flex items-center gap-6">
              <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[15px] font-medium text-center leading-tight">No Image</div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                <p className="text-sm text-gray-400 font-medium">SKU: {item.productId.slice(0, 8).toUpperCase()}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-red-500 hover:text-red-600 transition-colors md:hidden"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="col-span-1 md:col-span-2 text-center">
              <span className="md:hidden text-sm text-gray-400 mr-2 uppercase font-bold">Price:</span>
              <span className="text-lg font-bold text-gray-900">${item.unitPrice.toLocaleString()}</span>
            </div>

            {/* Quantity Controller */}
            <div className="col-span-1 md:col-span-2 flex justify-center">
              <div className="flex items-center rounded-xl border-2 border-gray-100 p-1 bg-white">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Minus size={18} />
                </button>
                <span className="w-10 text-center text-lg font-black text-gray-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isLoading}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Line Total & Remove (Desktop) */}
            <div className="col-span-1 md:col-span-2 flex flex-col items-end gap-2">
              <span className="md:hidden text-sm text-gray-400 mr-2 uppercase font-bold self-start">Total:</span>
              <div className="flex items-center gap-4">
                <span className="text-xl font-black text-blue-600">${item.lineTotal.toLocaleString()}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="hidden md:flex p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                  title="Remove item"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Continue Shopping */}
      <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <Link
          href="/products"
          className="text-sm font-bold text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>
        <span className="text-[15px] text-gray-400 italic">
          {cart.itemCount} items in your bag
        </span>
      </div>
    </div>
  );
};
