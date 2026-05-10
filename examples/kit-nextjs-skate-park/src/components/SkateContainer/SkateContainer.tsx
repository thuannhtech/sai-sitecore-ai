'use client';

import React, { JSX } from 'react';
import { AppPlaceholder } from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from 'lib/component-props';

interface SkateContainerProps extends ComponentProps {
  fields: any;
  params: any;
  rendering: any;
  page: any;
  componentMap: any;
}

export const Default = (props: SkateContainerProps): JSX.Element => {
  const { rendering, page, componentMap, params } = props;
  const styles = `${params.GridParameters || ''} ${params.styles || ''}`.trim();

  return (
    <div className={`component skate-container max-w-[1440px] mx-auto px-4 md:px-8 ${styles}`}>
      <div className="relative min-h-[50px]">
        <AppPlaceholder
          name="container-content-{*}"
          rendering={rendering}
          page={page}
          componentMap={componentMap}
        />
      </div>
    </div>
  );
};

export default Default;
