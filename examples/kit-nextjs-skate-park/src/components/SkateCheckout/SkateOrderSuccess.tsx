'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { OrderViewModel, OrderViewModelItem } from 'src/lib/checkout/models';
import { mapOrderApiResponse } from 'src/lib/orders/view-model';

interface SkateOrderSuccessProps {
  orderId?: string;
  embedded?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

export const SkateOrderSuccess = ({
  orderId,
  embedded = false,
  onBack,
  backLabel = 'Back to Order History',
}: SkateOrderSuccessProps) => {
  const searchParams = useSearchParams();
  const token = orderId || searchParams.get('token');
  const [order, setOrder] = useState<OrderViewModel | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!token) return;

      try {
        const response = await fetch(`/api/orders?id=${token}`);
        const result = await response.json().catch(() => ({}));

        if (result.ok && result.order) {
          setOrder(mapOrderApiResponse(result));
        } else {
          console.error('[Thank You] Order not found or API error:', result.error);
        }
      } catch (error) {
        console.error('[Thank You] Error fetching order:', error);
      }
    };

    void fetchOrder();
  }, [token]);

  if (!token) {
    return (
      <div className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl rounded-[2rem] border border-red-100 bg-red-50 px-8 py-10 text-center text-red-600 shadow-sm">
            <p className="mb-3 text-[16px] font-black uppercase tracking-[0.2em]">No Order Found</p>
            <p className="text-base font-medium md:text-lg">
              Please check your email for confirmation or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={embedded ? 'bg-transparent py-4' : 'bg-white py-14 md:py-20'}>
        <div className="container mx-auto max-w-5xl px-4">
          <div className="animate-pulse rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
            <div className="mb-8 h-5 w-56 rounded-full bg-blue-100"></div>
            <div className="mb-8 space-y-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex gap-4 rounded-[1.5rem] border border-white bg-white p-4">
                  <div className="h-20 w-20 rounded-[1.25rem] bg-gray-200"></div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 h-5 w-3/4 rounded-full bg-gray-200"></div>
                    <div className="h-4 w-1/2 rounded-full bg-gray-100"></div>
                  </div>
                  <div className="h-5 w-16 rounded-full bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = Number(order.cart?.subtotal) || 0;
  const shippingCost = Number(order.cart?.shippingCost) || 0;
  const taxCost = Number(order.cart?.taxCost) || 0;
  const promotionDiscount = Number(order.cart?.promotionDiscount) || 0;
  const grandTotal = Number(order.cart?.total) || subtotal + shippingCost + taxCost - promotionDiscount;

  return (
    <div className={embedded ? 'bg-transparent py-4' : 'bg-white py-14 md:py-20'}>
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-12">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="group mb-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-blue-600"
            >
              <ArrowRight size={14} className="rotate-180 transition-transform group-hover:-translate-x-1" />
              {backLabel}
            </button>
          ) : (
            <Link
              href="/products"
              className="group mb-4 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-gray-400 transition-colors hover:text-blue-600"
            >
              <ArrowRight size={14} className="rotate-180 transition-transform group-hover:-translate-x-1" />
              Continue Shopping
            </Link>
          )}
          <div className="h-1.5 w-20 rounded-full bg-blue-600"></div>
        </div>

        {!embedded ? (
          <div className="mb-10">
            <p className="mb-3 text-[13px] font-black uppercase tracking-[0.24em] text-blue-600">
              Thank You
            </p>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
              Your order has been placed
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
              We&apos;ve received your order and prepared a summary below for your reference.
            </p>
          </div>
        ) : null}

        <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
          <h2 className="mb-8 flex items-center gap-3 text-[16px] font-black uppercase tracking-[0.25em] text-blue-600">
            <ShoppingBag size={20} /> Order Summary ({order.cart?.items?.length || 0})
          </h2>

          <div className="mb-8 space-y-4">
            {order.cart?.items?.map((item: OrderViewModelItem) => {
              const itemPrice = Number(item.unitPrice) || 0;
              const itemQty = Number(item.quantity) || 1;
              const lineTotal = Number(item.lineTotal) || itemPrice * itemQty;

              return (
                <div key={item.id} className="flex gap-4 rounded-[1.5rem] border border-white bg-white p-4">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-gray-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <ShoppingBag size={28} className="text-blue-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-base font-bold leading-snug text-gray-900 md:text-[17px]">
                      {item.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-400">
                      Qty {itemQty} - ${itemPrice.toLocaleString()} / item
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-black text-gray-900 md:text-[17px]">
                      ${lineTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="flex justify-between text-[16px] font-medium text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[16px] font-medium text-gray-500">
              <span>Shipping</span>
              <span className={shippingCost > 0 ? 'font-bold text-gray-900' : 'font-bold uppercase text-green-600'}>
                {shippingCost > 0 ? `$${shippingCost.toLocaleString()}` : 'Free'}
              </span>
            </div>
            <div className="flex justify-between text-[16px] font-medium text-gray-500">
              <span>GST</span>
              <span className="font-bold text-gray-900">${taxCost.toLocaleString()}</span>
            </div>
            {promotionDiscount > 0 && (
              <div className="flex justify-between text-[16px] font-medium text-gray-500">
                <span>Promotion</span>
                <span className="font-bold text-green-600">-${promotionDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-end justify-between border-t border-gray-200 pt-5">
              <div>
                <span className="mb-2 block text-[13px] font-black uppercase tracking-[0.22em] text-gray-400">
                  Total
                </span>
                <span className="text-3xl font-black leading-none tracking-tight text-blue-600 md:text-[2.25rem]">
                  ${grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkateOrderSuccess;
