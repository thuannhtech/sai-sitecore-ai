'use client';

import React, { useRef, useState } from 'react';
import { RichText, Text } from '@sitecore-content-sdk/nextjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { MultiPromoItemProps, MultiPromoProps } from 'components/multi-promo/multi-promo.props';
import { Default as MultiPromoItem } from 'components/multi-promo/MultiPromoItem.dev';

export const Default: React.FC<MultiPromoProps> = (props) => {
  const { fields, params, page } = props;
  const { numColumns } = params ?? {};
  const rawChildren = fields?.data?.datasource?.children;

  const { title, description } = fields?.data?.datasource || {};
  const [announcement, setAnnouncement] = useState('');
  const swiperRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const isPageEditing = page?.mode?.isEditing;

  const hasPagesPositionStyles: boolean = props?.params?.styles
    ? props?.params?.styles.includes('position-')
    : false;

  const getSlidesPerView = (): number => {
    if (numColumns === '4') return 4;
    if (numColumns === '3') return 3;
    return 4; // Default to 4 as requested
  };

  const wrapperClasses = [
    'multi-promo',
    props?.params?.styles || '',
  ]
    .filter(Boolean)
    .join(' ');

  if (!fields) {
    return (
      <div className="multi-promo multi-promo--empty">
        <span className="is-empty-hint">Multi Promo</span>
      </div>
    );
  }

  return (
    <div data-component="MultiPromoCarousel" data-class-change className={wrapperClasses}>
      {/* Header: title */}
      <div className="multi-promo__header">
        {title && (
          <div className="multi-promo__title-wrapper">
            <Text
              tag="h2"
              field={title?.jsonValue}
              className="multi-promo__title"
            />
          </div>
        )}
      </div>

      {/* Carousel */}
      {rawChildren && (
        <>
          {isPageEditing ? (
            // In editing mode: render items in a flat grid (Swiper doesn't work well in editing mode)
            <div className="multi-promo__edit-grid">
              {rawChildren?.results?.map((item: MultiPromoItemProps, index: number) => (
                <div key={index} className="multi-promo__edit-grid-item">
                  <MultiPromoItem isPageEditing={isPageEditing} {...item} />
                </div>
              ))}
            </div>
          ) : (
            <Swiper
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                const newIndex = swiper.realIndex;
                setAnnouncement(
                  `Slide ${newIndex + 1} of ${rawChildren?.results?.length}`
                );
              }}
              modules={[A11y, Navigation]}
              navigation={{
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
              }}
              spaceBetween={32}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: getSlidesPerView(), spaceBetween: 32 },
              }}
              loop={rawChildren?.results?.length > getSlidesPerView()}
              className="multi-promo__swiper"
            >
              {rawChildren?.results?.map((item: MultiPromoItemProps, index: number) => (
                <SwiperSlide key={index} className="multi-promo__slide">
                  <MultiPromoItem isPageEditing={isPageEditing} {...item} />
                </SwiperSlide>
              ))}

              {/* Navigation Buttons for Mobile */}
              <button className="swiper-button-prev swiper-button-prev-promo" onClick={() => swiperRef.current?.slidePrev()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="swiper-button-next swiper-button-next-promo" onClick={() => swiperRef.current?.slideNext()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </Swiper>
          )}

          {/* Accessibility live region for slide announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </div>
        </>
      )}
    </div>
  );
};
