import React, { JSX } from 'react';
import { Text, AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import { SkateCartSummary } from '../SkateCart/SkateCartSummary';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import componentMap from '.sitecore/component-map';
import { ComponentProps } from 'lib/component-props';

interface SkateCheckoutProps extends ComponentProps {
  fields: any;
}

export const Default = (props: SkateCheckoutProps): JSX.Element => {
  const { fields, params, rendering, page } = props;
  const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();
  const isEditing = page?.mode?.isEditing;

  return (
    <div className={`component skate-checkout pt-12 pb-24 mb-10 ${styles}`}>
      <Script src="/storefront/js/checkout.js" strategy="afterInteractive" />
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-blue-600 transition-colors group uppercase tracking-widest mb-4"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to cart
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            <Text field={fields?.Title} defaultValue="Checkout" />
          </h1>
          <div className="mt-2 h-1.5 w-20 bg-blue-600 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Main Placeholder */}
          <div className="lg:col-span-2">
            <div className={isEditing ? 'min-h-[300px] border-2 border-dotted border-blue-200 rounded-3xl p-6 bg-blue-50/5' : ''}>
              <AppPlaceholder
                name="dynamic-checkout-content-{*}"
                rendering={rendering}
                page={page}
                componentMap={componentMap}
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <SkateCartSummary isCheckout={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Default;
