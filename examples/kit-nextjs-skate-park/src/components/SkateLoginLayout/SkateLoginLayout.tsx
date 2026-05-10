'use client';

import React, { JSX } from 'react';
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from 'lib/component-props';

interface SkateLoginLayoutProps extends ComponentProps {
  fields: any;
  params: any;
  rendering: any;
  page: any;
  componentMap: any;
}

export const Default = (props: SkateLoginLayoutProps): JSX.Element => {
  const { rendering, page, componentMap, params } = props;
  const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();

  return (
    <div className={`component skate-login-layout bg-white min-h-screen ${styles}`}>
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row min-h-screen relative">

        {/* RIGHT COLUMN: Banner Image Area */}
        <aside className="hidden md:flex md:w-1/2 lg:w-[55%] bg-gray-50 relative overflow-hidden border-l border-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dynamic Placeholder for Banner/Visuals */}
            <div className="w-full h-full relative">
              <AppPlaceholder
                name="login-banner-{*}"
                rendering={rendering}
                page={page}
                componentMap={componentMap}
              />
            </div>
          </div>

          {/* Subtle Decorative Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
        </aside>

        {/* LEFT COLUMN: Login Form Area */}
        <main className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white">
          <div className="w-full max-w-md">
            {/* Dynamic Placeholder for Login Form */}
            <div className="relative min-h-[100px]">
              <AppPlaceholder
                name="login-form-{*}"
                rendering={rendering}
                page={page}
                componentMap={componentMap}
              />
            </div>
          </div>
        </main>



      </div>
    </div>
  );
};

export default Default;
