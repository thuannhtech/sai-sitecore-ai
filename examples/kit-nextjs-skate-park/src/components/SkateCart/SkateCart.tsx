'use client';

import React, { JSX } from 'react';
import { Field, Text } from "@sitecore-content-sdk/nextjs";
import { SkateCartItemList } from './SkateCartItemList';
import { SkateCartSummary } from './SkateCartSummary';

interface Fields {
  Title: Field<string>;
}

type SkateCartProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: SkateCartProps): JSX.Element => {
  const { fields } = props;
  const styles = `${props.params.GridParameters || ''} ${props.params.styles || ''}`.trim();

  return (
    <div className={`component skate-cart ${styles}`}>
      <div className="pt-12 pb-24">
        <div className="container mx-auto px-4">
          {/* Page Title */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              <Text field={fields?.Title} defaultValue="Your Shopping Cart" />
            </h1>
            <div className="mt-2 h-1.5 w-20 bg-blue-600 rounded-full"></div>
          </div>

          {/* Cart Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
            {/* Main Content: Item List (2/3 width on LG) */}
            <div className="lg:col-span-2">
              <SkateCartItemList />
            </div>

            {/* Sidebar: Summary (1/3 width on LG) */}
            <div className="lg:col-span-1">
              <SkateCartSummary onProceedToCheckout={() => window.location.href = '/checkout'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Default;