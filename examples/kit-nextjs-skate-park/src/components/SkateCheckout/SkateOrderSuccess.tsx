'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CreditCard,
  Package,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { OrderViewModel, OrderViewModelItem } from 'src/lib/checkout/models';

interface SkateOrderSuccessProps {
  orderId?: string;
  embedded?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

interface SourceLineItem {
  id?: string;
  ID?: string;
  name?: string;
  Product?: {
    Name?: string;
    xp?: {
      Images?: Array<{
        Url?: string;
      }>;
    };
  };
  ProductID?: string;
  quantity?: number | string;
  Quantity?: number | string;
  unitPrice?: number | string;
  price?: number | string;
  UnitPrice?: number | string;
  lineTotal?: number | string;
  LineTotal?: number | string;
  imageUrl?: string;
  xp?: {
    ImageUrl?: string;
  };
}

/**
 * SkateOrderSuccess
 * Rendering for the Thank You page.
 * Retrieves order details from the order API based on the ?token query param.
 */
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
        console.log('[Thank You] Fetching order details for token:', token);
        const response = await fetch(`/api/orders?id=${token}`);
        const result = await response.json();

        if (result.ok && result.order) {
          const ocOrder = result.order;
          const storefrontCheckout = ocOrder.xp?.storefrontCheckout || ocOrder.xp?.StorefrontCheckout || {};
          const storefrontPaymentMethod = storefrontCheckout.paymentMethod || {};
          const storefrontTransaction = storefrontCheckout.transaction || {};
          const ocItems =
            result.lineItems && result.lineItems.length > 0
              ? result.lineItems
              : storefrontCheckout.cart?.items || [];
          const shippingAddress = result.lineItems?.[0]?.ShippingAddress || {};

          const mappedOrder: OrderViewModel = {
            orderId: ocOrder.ID,
            orderDate: ocOrder.DateSubmitted || ocOrder.DateCreated,
            customer: {
              firstName: ocOrder?.FromUser?.FirstName || 'N/A',
              lastName: ocOrder?.FromUser?.LastName || '',
              phoneNumber: ocOrder?.FromUser?.Phone || 'N/A',
            },
            shippingAddress: {
              FullName: `${shippingAddress.FirstName || ''} ${shippingAddress.LastName || ''}`.trim(),
              Address: `${shippingAddress.Street1 || ''}`.trim(),
              PhoneNumber: shippingAddress.Phone,
            },
            shippingMethod: {
              id:
                ocOrder.xp?.ShippingMethodID ||
                storefrontCheckout.shippingMethod?.id ||
                '',
              name:
                ocOrder.xp?.ShippingMethodName ||
                storefrontCheckout.shippingMethod?.name ||
                '',
              time:
                ocOrder.xp?.ShippingMethodTime ||
                storefrontCheckout.shippingMethod?.time ||
                '',
              price:
                Number(
                  ocOrder.xp?.ShippingCost ??
                    storefrontCheckout.shippingMethod?.price ??
                    ocOrder.ShippingCost
                ) || 0,
            },
            paymentMethod: {
              id: storefrontPaymentMethod.id || ocOrder.xp?.PaymentMethod || 'Credit Card',
              label:
                storefrontPaymentMethod.label ||
                storefrontTransaction.description ||
                (storefrontPaymentMethod.cardType && storefrontPaymentMethod.last4
                  ? `${storefrontPaymentMethod.cardType} ending in ${storefrontPaymentMethod.last4}`
                  : storefrontPaymentMethod.id || ocOrder.xp?.PaymentMethod || 'Credit Card'),
              provider: storefrontPaymentMethod.provider || storefrontTransaction.provider || '',
              cardType: storefrontPaymentMethod.cardType || storefrontTransaction.cardType || '',
              last4: storefrontPaymentMethod.last4 || storefrontTransaction.last4 || '',
              status: ocOrder.xp?.PaymentStatus || '',
            },
            cart: {
              items: ocItems.map((item: SourceLineItem) => ({
                id: item.id || item.ID,
                name: item.name || item.Product?.Name || item.ProductID || 'Product',
                quantity: Number(item.quantity || item.Quantity) || 0,
                unitPrice: Number(item.unitPrice || item.price || item.UnitPrice) || 0,
                lineTotal: Number(item.lineTotal || item.LineTotal) || 0,
                imageUrl:
                  item.imageUrl || item.xp?.ImageUrl || item.Product?.xp?.Images?.[0]?.Url,
              })),
              subtotal: Number(ocOrder.Subtotal || storefrontCheckout.cart?.subtotal) || 0,
              shippingCost: Number(ocOrder.ShippingCost ?? storefrontCheckout.cart?.shippingAmount) || 0,
              taxCost: Number(ocOrder.TaxCost ?? storefrontCheckout.cart?.taxAmount) || 0,
              promotionDiscount:
                Number(ocOrder.PromotionDiscount ?? storefrontCheckout.cart?.promotionDiscount) || 0,
              total: Number(ocOrder.Total ?? storefrontCheckout.cart?.total) || 0,
              gstRate: Number(ocOrder.xp?.GST) || 0,
            },
          };

          setOrder(mappedOrder);
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
        <div className="container relative mx-auto max-w-5xl px-4">
          <div className="pointer-events-none absolute inset-4 z-10 flex items-center justify-center rounded-[2rem] bg-white/40 backdrop-blur-[1px] md:inset-0">
            <div className="flex flex-col items-center gap-4 rounded-[1.5rem] border border-white/70 bg-white/75 px-8 py-6 shadow-lg shadow-blue-100/40">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <div className="text-center">
                <p className="text-[13px] font-black uppercase tracking-[0.24em] text-blue-600">
                  Loading
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500">Fetching order details...</p>
              </div>
            </div>
          </div>

          <div className="animate-pulse">
          <div className="mb-12">
            <div className="mb-4 h-4 w-40 rounded-full bg-gray-200"></div>
            <div className="h-1.5 w-20 rounded-full bg-gray-200"></div>
          </div>

          <div className="mb-12 rounded-[2rem] border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-8 shadow-sm md:p-12">
            <div className="mb-8 h-20 w-20 rounded-[1.75rem] bg-white/80"></div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
              <div>
                <div className="mb-3 h-4 w-36 rounded-full bg-blue-100"></div>
                <div className="mb-4 h-12 w-full max-w-[420px] rounded-[1rem] bg-white"></div>
                <div className="h-5 w-full max-w-[520px] rounded-full bg-white"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white bg-white/90 p-5 shadow-sm">
                  <div className="mb-2 h-3 w-20 rounded-full bg-gray-200"></div>
                  <div className="h-6 w-28 rounded-full bg-gray-200"></div>
                </div>
                <div className="rounded-[1.5rem] border border-white bg-white/90 p-5 shadow-sm">
                  <div className="mb-2 h-3 w-16 rounded-full bg-gray-200"></div>
                  <div className="h-8 w-32 rounded-full bg-blue-100"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
                <div className="mb-8 h-5 w-48 rounded-full bg-blue-100"></div>
                <div className="grid gap-6 md:grid-cols-2">
                  {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="rounded-[1.5rem] border border-white bg-white p-6">
                      <div className="mb-3 h-3 w-28 rounded-full bg-gray-200"></div>
                      <div className="mb-2 h-6 w-3/4 rounded-full bg-gray-200"></div>
                      <div className="h-4 w-1/2 rounded-full bg-gray-100"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
                <div className="mb-8 h-5 w-52 rounded-full bg-blue-100"></div>
                <div className="rounded-[1.5rem] border border-white bg-white p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-blue-100"></div>
                      <div>
                        <div className="mb-2 h-3 w-28 rounded-full bg-gray-200"></div>
                        <div className="h-5 w-48 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                    <div className="h-10 w-28 rounded-full bg-green-100"></div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="mb-2 h-3 w-28 rounded-full bg-gray-200"></div>
                    <div className="h-7 w-72 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="h-14 w-44 rounded-[1.25rem] bg-blue-100"></div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm lg:sticky lg:top-8">
              <div className="mb-8 h-5 w-56 rounded-full bg-blue-100"></div>

              <div className="mb-8 space-y-4">
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex gap-4 rounded-[1.5rem] border border-white bg-white p-4"
                  >
                    <div className="h-20 w-20 flex-shrink-0 rounded-[1.25rem] bg-gray-200"></div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 h-5 w-3/4 rounded-full bg-gray-200"></div>
                      <div className="h-4 w-1/2 rounded-full bg-gray-100"></div>
                    </div>
                    <div className="h-5 w-16 rounded-full bg-gray-200"></div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t border-gray-200 pt-6">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex justify-between">
                    <div className="h-4 w-24 rounded-full bg-gray-200"></div>
                    <div className="h-4 w-16 rounded-full bg-gray-200"></div>
                  </div>
                ))}
                <div className="flex items-end justify-between border-t border-gray-200 pt-5">
                  <div>
                    <div className="mb-2 h-3 w-14 rounded-full bg-gray-200"></div>
                    <div className="h-8 w-28 rounded-full bg-blue-100"></div>
                  </div>
                  <div className="h-10 w-24 rounded-full bg-green-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  const orderDateLabel = order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'N/A';
  const subtotal = Number(order.cart?.subtotal) || 0;
  const shippingCost = Number(order.cart?.shippingCost) || 0;
  const taxCost = Number(order.cart?.taxCost) || 0;
  const promotionDiscount = Number(order.cart?.promotionDiscount) || 0;
  const grandTotal = Number(order.cart?.total) || subtotal + shippingCost + taxCost - promotionDiscount;
  const gstRate = Number(order.cart?.gstRate) || 0;
  const paymentLabel = order.paymentMethod?.label || order.paymentMethod?.id || 'Payment';
  const paymentStatus = order.paymentMethod?.status || 'Paid';
  const shippingMethodName = order.shippingMethod?.name || '-';
  const shippingMethodId = order.shippingMethod?.id || '-';
  const shippingMethodTime = order.shippingMethod?.time || '-';
  const shippingMethodPrice = Number(order.shippingMethod?.price) || 0;

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

        <div className="mb-12 rounded-[2rem] border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-8 shadow-sm md:p-12">
          <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-green-600 text-white shadow-lg shadow-green-100">
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
            <div>
              <p className="mb-3 text-[14px] font-black uppercase tracking-[0.3em] text-blue-600">
                Order Confirmed
              </p>
              <h1 className="mb-4 text-[2.25rem] font-black uppercase tracking-tight text-gray-900 leading-[0.95] md:text-[3.25rem]">
                You&apos;re All Set
              </h1>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-gray-500 md:text-lg">
                Order <span className="font-black text-blue-600">#{order.orderId}</span> is confirmed
                and moving into fulfillment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white bg-white/90 p-5 shadow-sm">
                <p className="mb-2 text-[12px] font-black uppercase tracking-[0.25em] text-gray-400">
                  Order Date
                </p>
                <p className="text-base font-bold text-gray-900 md:text-lg">{orderDateLabel}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white bg-white/90 p-5 shadow-sm">
                <p className="mb-2 text-[12px] font-black uppercase tracking-[0.25em] text-gray-400">
                  Total
                </p>
                <p className="text-[1.75rem] font-black leading-none text-blue-600 md:text-[2rem]">
                  ${grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
              <h2 className="mb-8 flex items-center gap-3 text-[16px] font-black uppercase tracking-[0.25em] text-blue-600">
                <Package size={20} /> Delivery Details
              </h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white bg-white p-6">
                  <p className="mb-2 text-[13px] font-black uppercase tracking-[0.22em] text-gray-400">
                    Recipient & Contact
                  </p>
                  <p className="text-lg font-bold text-gray-900 md:text-[20px]">
                    {order.shippingAddress?.FullName || 'N/A'}
                  </p>
                  <p className="mt-1 text-base font-black text-blue-600 md:text-[17px]">
                    {order.shippingAddress?.PhoneNumber || 'N/A'}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white bg-white p-6">
                  <p className="mb-2 text-[13px] font-black uppercase tracking-[0.22em] text-gray-400">
                    Shipping Address
                  </p>
                  <p className="text-base font-bold leading-relaxed text-gray-900 md:text-[17px]">
                    {order.shippingAddress?.Address || 'N/A'}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white bg-white p-6">
                  <p className="mb-2 text-[13px] font-black uppercase tracking-[0.22em] text-gray-400">
                    Shipping Method
                  </p>
                  <div className="flex items-center gap-3 text-base font-bold text-gray-900 md:text-[17px]">
                    <Truck size={18} className="text-blue-600" />
                    {shippingMethodName}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-400">
                    {shippingMethodId} · {shippingMethodTime} ·{' '}
                    {shippingMethodPrice > 0 ? `$${shippingMethodPrice.toLocaleString()}` : 'Free'}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white bg-white p-6">
                  <p className="mb-2 text-[13px] font-black uppercase tracking-[0.22em] text-gray-400">
                    Purchase Date
                  </p>
                  <div className="flex items-center gap-3 text-base font-bold text-gray-900 md:text-[17px]">
                    <Calendar size={18} className="text-orange-600" />
                    {orderDateLabel}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm">
              <h2 className="mb-8 flex items-center gap-3 text-[16px] font-black uppercase tracking-[0.25em] text-blue-600">
                <CreditCard size={20} /> Payment Information
              </h2>

              <div className="flex flex-col gap-4 rounded-[1.5rem] border border-white bg-white p-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="mb-1 text-[13px] font-black uppercase tracking-[0.22em] text-gray-400">
                      Payment Method
                    </p>
                    <p className="text-base font-bold text-gray-900 md:text-[17px]">Paid via {paymentLabel}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-3 self-start rounded-full bg-green-50 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-green-600 md:self-auto">
                  <CheckCircle2 size={16} />
                  Success
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="mb-2 text-[14px] font-black uppercase tracking-[0.25em] text-gray-400">
                    Need More Gear?
                  </p>
                  <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 md:text-2xl">
                    Back to the product lineup
                  </h3>
                </div>

                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-3 rounded-[1.25rem] bg-blue-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] !text-white transition-colors hover:bg-blue-700 hover:!text-white"
                >
                  Shop Products
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-8 shadow-sm lg:sticky lg:top-8">
            <h2 className="mb-8 flex items-center gap-3 text-[16px] font-black uppercase tracking-[0.25em] text-blue-600">
              <ShoppingBag size={20} /> Order Summary ({order.cart?.items?.length || 0})
            </h2>

            <div className="mb-8 space-y-4">
              {order.cart?.items?.map((item: OrderViewModelItem) => {
                const itemPrice = Number(item.unitPrice) || 0;
                const itemQty = Number(item.quantity) || 1;
                const lineTotal = Number(item.lineTotal) || itemPrice * itemQty;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-[1.5rem] border border-white bg-white p-4"
                  >
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
                <span>{gstRate > 0 ? `GST (${gstRate}%)` : 'GST'}</span>
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
                <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-green-600">
                  {paymentStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkateOrderSuccess;
