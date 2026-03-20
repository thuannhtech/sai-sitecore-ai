'use client';

import React from 'react';
import {
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
  RichText,
} from '@sitecore-content-sdk/nextjs';
import { MultiPromoItemProps } from 'components/multi-promo/multi-promo.props';

const mapToItemProps = (fields: MultiPromoItemProps) => {
  return {
    title: fields?.heading?.jsonValue,
    image: fields?.image?.jsonValue,
    link: fields?.link?.jsonValue,
    description: fields?.description?.jsonValue,
    isPageEditing: fields?.isPageEditing,
  };
};

export const Default: React.FC<MultiPromoItemProps> = (props) => {
  const itemProps = mapToItemProps(props || {});

  const { title, image, link, description, isPageEditing } = itemProps || {};

  if (!isPageEditing && !title?.value && !image?.value?.src) {
    return null;
  }

  console.log('itemProps', itemProps);

  return (
    <div className="multi-promo__item">
      {(isPageEditing || image?.value?.src) && (
        <ContentSdkLink field={link || {}} className="multi-promo__item-image-link">
          <div className="multi-promo__item-image-wrapper">
            <ContentSdkImage
              field={image}
              className="multi-promo__item-image"
              width={480}
              height={360}
            />
          </div>
        </ContentSdkLink>
      )}
      {(isPageEditing || title?.value) && (
        <Text
          tag="h3"
          field={title}
          className="multi-promo__item-title"
        />
      )}
      {(isPageEditing || description?.value) && (
        <RichText
          field={description}
          className="multi-promo__item-description"
        />
      )}
      {/* Show the link text ONLY in editing mode for content editors */}
      {isPageEditing && (
        <ContentSdkLink
          field={link || {}}
          className="multi-promo__item-link"
        />
      )}
    </div>
  );
};

