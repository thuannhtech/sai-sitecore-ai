import React from 'react';
import { Image, ImageField } from '@sitecore-content-sdk/nextjs';

interface Fields {
  Image: ImageField;
}

type SitecoreAiGeneratedVariantProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const SitecoreAiGeneratedVariant: React.FC<SitecoreAiGeneratedVariantProps> = ({
  params = {},
  fields = { Image: { value: { src: '', alt: '' } } as unknown as ImageField },
}) => {
  if (!fields) return null;
  const styles = `${params?.GridParameters || ''} ${params?.styles || ''}`.trim();
  const id = params?.RenderingIdentifier || undefined;

  return (
    <section
      className={`component centered-image ${styles}`.trim()}
      id={id}
    >
      <div className="w-full">
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] 2xl:h-[32rem] flex items-center justify-center overflow-hidden">
          <Image
            field={fields?.Image}
            className="max-w-full max-h-full object-contain object-center"
          />
        </div>
      </div>
    </section>
  );
};