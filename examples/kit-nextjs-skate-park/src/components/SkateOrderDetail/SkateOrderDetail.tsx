'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Package, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { OrderViewModel, OrderViewModelItem } from 'src/lib/checkout/models';
import { mapOrderApiResponse } from 'src/lib/orders/view-model';

interface SkateOrderDetailProps {
  orderId: string;
}

export const SkateOrderDetail = ({ orderId }: SkateOrderDetailProps) => {
  const [order, setOrder] = useState<OrderViewModel | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        return;
      }

      try {
        const response = await fetch(`/api/orders?id=${orderId}`);
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok || !result.order) {
          throw new Error(result.error || 'Failed to fetch order detail');
        }

        setOrder(mapOrderApiResponse(result));
      } catch (error) {
        console.error('[Order Detail] Error fetching order:', error);
      }
    };

    void fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Loading Order</p>
      </div>
    );
  }

  const orderDateLabel = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A';
  const subtotal = Number(order.cart?.subtotal) || 0;
  const shippingCost = Number(order.cart?.shippingCost) || 0;
  const taxCost = Number(order.cart?.taxCost) || 0;
  const promotionDiscount = Number(order.cart?.promotionDiscount) || 0;
  const total = Number(order.cart?.total) || subtotal + shippingCost + taxCost - promotionDiscount;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-6">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            Order Created Date
          </p>
          <div className="flex items-center gap-3 text-base font-bold text-gray-900">
            <Calendar size={16} className="text-orange-600" />
            {orderDateLabel}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-6">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            Order Status
          </p>
          <p className="text-base font-bold text-gray-900">{order.status}</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
        <h2 className="mb-8 flex items-center gap-3 text-[16px] font-black uppercase tracking-[0.25em] text-blue-600">
          <ShoppingBag size={20} /> Order Items
        </h2>

        <div className="space-y-4">
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
                    <Package size={28} className="text-blue-600" />
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
      </div>

      <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
        <div className="space-y-4">
          <div className="flex justify-between text-[16px] font-medium text-gray-500">
            <span>Subtotal</span>
            <span className="font-bold text-gray-900">${subtotal.toLocaleString()}</span>
          </div>
          {promotionDiscount > 0 && (
            <div className="flex justify-between text-[16px] font-medium text-gray-500">
              <span>Promotion</span>
              <span className="font-bold text-green-600">-${promotionDiscount.toLocaleString()}</span>
            </div>
          )}
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
          <div className="flex items-end justify-between border-t border-gray-200 pt-5">
            <div>
              <span className="mb-2 block text-[13px] font-black uppercase tracking-[0.22em] text-gray-400">
                Total
              </span>
              <span className="text-3xl font-black leading-none tracking-tight text-blue-600 md:text-[2.25rem]">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkateOrderDetail;
