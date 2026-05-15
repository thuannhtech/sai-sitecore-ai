'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, ShieldCheck, Truck, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { useSkateCartStore } from 'src/lib/cart/store';
import { useSkateCheckoutStore } from 'src/lib/payment/store';

const DEFAULT_TAX_RATE = 0.08;

interface SkateCartSummaryProps {
  isCheckout?: boolean;
  onPlaceOrder?: () => void;
  onProceedToCheckout?: () => void;
}

export const SkateCartSummary: React.FC<SkateCartSummaryProps> = ({ isCheckout = false, onPlaceOrder, onProceedToCheckout }) => {
  const { cart, isLoading, isProcessing, error, applyPromotion } = useSkateCartStore();
  const shippingMethod = useSkateCheckoutStore((state) => state.shippingMethod);
  const [promoCode, setPromoCode] = useState('');
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX_RATE);
  const [taxLabel, setTaxLabel] = useState('8%');

  const subtotal = cart?.subtotal || 0;
  const promotionDiscount = cart?.promotionDiscount || 0;
  const shipping = isCheckout ? cart?.shippingCost ?? shippingMethod?.price ?? 0 : 0;
  const discountedSubtotal = Math.max(subtotal - promotionDiscount, 0);
  const tax = discountedSubtotal * taxRate;
  const total = discountedSubtotal + shipping + tax;
  const hasItems = cart && cart.items.length > 0;
  const isBusy = isLoading || isProcessing;
  const effectiveShippingMethod = cart?.shippingMethod?.id ? cart.shippingMethod : shippingMethod;
  const shippingLabel =
    shipping > 0
      ? `$${shipping.toLocaleString()}`
      : 'FREE';
  const shippingEta = effectiveShippingMethod?.time || '3-5 business days';

  useEffect(() => {
    let isMounted = true;

    const loadCommerceSettings = async () => {
      try {
        const response = await fetch('/api/commerce/settings');
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          return;
        }

        if (isMounted && typeof payload?.taxRate === 'number') {
          setTaxRate(payload.taxRate);
        }

        if (isMounted && typeof payload?.taxLabel === 'string' && payload.taxLabel.trim()) {
          setTaxLabel(payload.taxLabel);
        }
      } catch (fetchError) {
        console.error('Failed to load commerce settings:', fetchError);
      }
    };

    void loadCommerceSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyPromotion = async () => {
    const code = promoCode.trim();
    if (!code) {
      setPromoMessage('Enter a promo code.');
      return;
    }

    try {
      await applyPromotion(code);
      setPromoMessage(`Promo code "${code}" applied.`);
      setPromoCode('');
    } catch (promoError) {
      const message = promoError instanceof Error ? promoError.message : 'Failed to apply promo code';
      setPromoMessage(message);
    }
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-8 lg:sticky lg:top-8 border border-gray-100 shadow-sm">
      <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-tight">
        Order Summary
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Subtotal</span>
          <span className="text-gray-900">${subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Estimated Shipping</span>
          <span className={shipping > 0 ? 'text-gray-900 font-bold' : 'text-green-600 font-bold'}>
            {shippingLabel}
          </span>
        </div>
        <div className="flex justify-between text-gray-500 font-medium">
          <span>Tax ({taxLabel})</span>
          <span className="text-gray-900">${tax.toLocaleString()}</span>
        </div>
        {promotionDiscount > 0 && (
          <div className="flex justify-between text-gray-500 font-medium">
            <span>Promotion</span>
            <span className="text-green-600">-${promotionDiscount.toLocaleString()}</span>
          </div>
        )}
        <div className="pt-4 border-t border-gray-200 flex justify-between items-end">
          <span className="tex-[15px] font-bold text-gray-900">Total</span>
          <div className="text-right">
            <span className="block text-3xl font-black text-blue-600 leading-none">
              ${total.toLocaleString()}
            </span>
            <span className="text-[13px] text-gray-400 font-medium uppercase mt-1 block">incl. all taxes</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          disabled={isBusy || !hasItems}
          className={`cursor-pointer w-full text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ${isCheckout
            ? 'bg-green-600 shadow-green-100 hover:enabled:bg-green-700 place-order-btn'
            : 'bg-blue-600 shadow-blue-100 hover:enabled:bg-blue-700'
            } hover:enabled:-translate-y-1 active:enabled:translate-y-0`}
          onClick={() => {
            if (isCheckout) {
              onPlaceOrder && onPlaceOrder();
            } else {
              onProceedToCheckout && onProceedToCheckout();
            }
          }}
        >
          {isBusy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {isCheckout ? 'PROCESSING...' : 'UPDATING CART...'}
            </>
          ) : isCheckout ? (
            <>
              <CheckCircle2 className="" />
              PLACE ORDER
            </>
          ) : (
            <>
              <CreditCard className="group-hover:animate-pulse" />
              PROCEED TO CHECKOUT
            </>
          )}
        </button>

        <div className="p-4 bg-white/50 rounded-xl border border-dashed border-gray-200">
          <p className="text-[13px] text-gray-500 flex items-center gap-2 mb-2">
            <Truck size={14} className="text-blue-600" />
            Delivery in {shippingEta}
          </p>
          <p className="text-[13px] text-gray-500 flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-600" />
            Secure checkout guaranteed
          </p>
        </div>
      </div>

      {/* Promo Code Option */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <button
          type="button"
          className="text-[15px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
          onClick={() => {
            setIsPromoOpen((open) => !open);
            setPromoMessage(null);
          }}
        >
          <ShoppingBag size={16} />
          Have a promo code?
        </button>

        {isPromoOpen && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-[14px] font-medium text-gray-900 outline-none focus:border-blue-500"
              />
              <button
                type="button"
                disabled={isBusy || !hasItems}
                onClick={handleApplyPromotion}
                className="rounded-xl bg-blue-600 px-4 py-3 text-[13px] font-black text-white transition-colors hover:enabled:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                APPLY
              </button>
            </div>

            {(promoMessage || error) && (
              <p className={`text-[12px] font-medium ${error ? 'text-red-500' : 'text-green-600'}`}>
                {promoMessage || error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
