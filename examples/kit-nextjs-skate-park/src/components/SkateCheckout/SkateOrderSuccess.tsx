'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, CreditCard, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

/**
 * SkateOrderSuccess
 * Rendering for the Thank You page.
 * Retrieves order details from localStorage based on the ?token query param.
 */
export const SkateOrderSuccess = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (token) {
      const orders = JSON.parse(localStorage.getItem('skate_orders') || '[]');
      const foundOrder = orders.find((o: any) => o.orderId === token);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
  }, [token]);

  if (!token) {
    return (
      <div className="py-24 text-center">
        <div className="bg-red-50 text-red-600 p-10 rounded-[20px] inline-block max-w-lg border border-red-100">
          <p className="font-black uppercase tracking-tight mb-4 text-[16px]">No Order Found</p>
          <p className="text-[18px]">Please check your email for confirmation or contact support.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-8 font-black text-gray-400 uppercase tracking-widest text-[16px]">Searching for your order...</p>
      </div>
    );
  }

  return (
    <div className="py-16 md:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Success Header */}
        <div className="text-center mb-20 light-block">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-green-100 text-green-600 rounded-full mb-10 animate-bounce shadow-lg shadow-green-100">
            <CheckCircle2 size={56} strokeWidth={2.5} />
          </div>
          <h1 className="text-[44px] md:text-[64px] font-black tracking-tight uppercase mb-6 italic leading-none">
            YOU'RE ALL SET!
          </h1>
          <p className="text-gray-500 text-[18px] md:text-[22px] font-medium max-w-2xl mx-auto normal-case not-italic leading-relaxed">
            Order <span className="text-blue-600 font-black">#{order.orderId}</span> is confirmed and heading to the warehouse.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Column 1: Order Details */}
          <div className="space-y-10 light-block">
            <div className="bg-gray-50 rounded-[20px] p-10 border border-gray-100">
              <h2 className="section-title mb-8 flex items-center gap-3">
                <Package size={22} /> Delivery Details
              </h2>
              <div className="space-y-8">
                <div>
                  <label className="text-[15px] font-black text-gray-400 uppercase block mb-2 tracking-wider">Customer</label>
                  <p className="text-gray-900 font-bold text-[20px]">
                    {order.shippingAddress?.FullName || order.customer?.firstName + ' ' + order.customer?.lastName}
                  </p>
                  <p className="text-gray-500 text-[16px] mt-1">{order.shippingAddress?.PhoneNumber || order.customer?.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-[15px] font-black text-gray-400 uppercase block mb-2 tracking-wider">Shipping Address</label>
                  <p className="text-gray-900 font-bold leading-relaxed text-[18px]">
                    {order.shippingAddress?.Address || order.shippingAddress?.addressLine1}
                  </p>
                </div>
                <div className="flex flex-wrap gap-12">
                  <div>
                    <label className="text-[15px] font-black text-gray-400 uppercase block mb-2 tracking-wider">Method</label>
                    <div className="flex items-center gap-3 text-gray-900 font-bold text-[18px]">
                      <Truck size={20} className="text-blue-600" />
                      {order.shippingMethod?.name}
                    </div>
                  </div>
                  <div>
                    <label className="text-[15px] font-black text-gray-400 uppercase block mb-2 tracking-wider">Date</label>
                    <div className="flex items-center gap-3 text-gray-900 font-bold text-[18px]">
                      <Calendar size={20} className="text-blue-600" />
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-[20px] p-10 border border-gray-100">
              <h2 className="section-title mb-8 flex items-center gap-3">
                <CreditCard size={22} /> Payment Information
              </h2>
              <div className="flex items-center justify-between p-6 bg-white rounded-[20px] border border-gray-200">
                <div className="flex items-center gap-6">
                  <div className="px-4 py-2 bg-gray-100 rounded-[10px] flex items-center justify-center font-black text-[16px] text-gray-500 uppercase">
                    {order.paymentMethod?.id}
                  </div>
                  <span className="font-bold text-gray-900 text-[18px]">Paid via {order.paymentMethod?.id === 'braintree' ? 'Credit Card' : order.paymentMethod?.id}</span>
                </div>
                <span className="text-green-600 font-black text-[15px] uppercase tracking-widest">Success</span>
              </div>
            </div>
          </div>

          {/* Column 2: Items Summary */}
          <div className="bg-gray-900 rounded-[20px] p-10 text-white shadow-2xl shadow-blue-500/10 dark-block">
            <h2 className="section-title mb-10">
              Order Items ({order.cart?.items?.length})
            </h2>

            <div className="space-y-8 mb-10 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {order.cart?.items?.map((item: any) => {
                const itemPrice = Number(item.unitPrice || item.price) || 0;
                const itemQty = Number(item.quantity) || 1;
                const lineTotal = Number(item.lineTotal) || (itemPrice * itemQty);

                return (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-[15px] flex-shrink-0 flex items-center justify-center border border-white/5 shadow-inner overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag size={32} className="text-blue-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-[18px] md:text-[20px] leading-snug mb-1 text-white">{item.name}</h3>
                      <p className="text-[15px] text-blue-200/50 font-medium tracking-wide italic-off">
                        Quantity: {itemQty} • ${itemPrice.toLocaleString()} / item
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[18px] text-white">${lineTotal.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/10 pt-10 space-y-5">
              <div className="flex justify-between text-blue-200/50 font-medium text-[16px] md:text-[18px]">
                <span>Subtotal</span>
                <span className="text-white">${(Number(order.cart?.subtotal) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-blue-200/50 font-medium text-[16px] md:text-[18px]">
                <span>Shipping Fee</span>
                <span className="text-green-400 font-bold uppercase tracking-widest">Free</span>
              </div>
              <div className="flex justify-between items-end pt-6">
                <div>
                  <span className="text-[15px] font-black text-blue-400 uppercase tracking-[0.3em] block mb-2">Grand Total</span>
                  <span className="text-[48px] md:text-[56px] font-black italic tracking-tighter text-white leading-none">${(Number(order.cart?.subtotal) || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="mt-20 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-4 text-[18px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-all group"
          >
            <ArrowRight size={24} className="rotate-180 group-hover:-translate-x-3 transition-transform" />
            Continue Shopping
          </Link>
        </div>
      </div>

      <style jsx>{`
        h1, h2, h3, h4, h5, h6 {
          margin: 0;
          color: inherit !important;
        }

        .section-title {
          font-size: 1rem !important; /* 16px */
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.25em !important;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .light-block h1 { color: #111827 !important; }
        .light-block .section-title { color: #2563eb !important; }
        
        .dark-block h1 { color: #ffffff !important; }
        .dark-block .section-title { color: #60a5fa !important; }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default SkateOrderSuccess;
