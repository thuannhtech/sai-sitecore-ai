"use client";
import React, { useRef, useState } from 'react';
import { Image } from '@sitecore-content-sdk/nextjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SlideFields {
    Image?: { metadata?: unknown; value?: { src?: string; alt?: string; width?: number; height?: number } };
}

interface SlideItem {
    id: string;
    name: string;
    displayName: string;
    url: string;
    fields: SlideFields;
}

interface BannerSliderFields {
    items?: SlideItem[];
}

type Props = {
    fields?: BannerSliderFields;
    rendering?: any;
    params?: any;
    page?: any;
};

import { useLocale } from 'next-intl';

export const Default = (props: Props) => {
    const locale = useLocale();
    const { fields, params = {}, page } = props;
    const slides = fields?.items ?? [];

    const [isPlaying, setIsPlaying] = useState(true);
    const swiperRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const isEditing = page?.mode?.isEditing || false;

    const styles = `${params?.GridParameters || ''} ${params?.styles || ''}`.trim();
    const rawId = params?.RenderingIdentifier || 'slider-banner-main';
    const containerId = rawId.replace(/[^a-zA-Z0-9-]/g, '');

    const togglePlayPause = () => {
        if (!swiperRef.current || !swiperRef.current.autoplay) return;
        if (isPlaying) {
            swiperRef.current.autoplay.stop();
        } else {
            swiperRef.current.autoplay.start();
        }
        setIsPlaying(!isPlaying);
    };

    if (!fields) {
        return (
            <div className="banner-slider-section banner-slider-section--empty">
                <span className="is-empty-hint">New Banner Slider</span>
            </div>
        );
    }

    const renderSlideContent = (slide: SlideItem, index: number) => (
        <div key={slide.id || index} className="banner-slide__inner">
            <Image
                field={slide.fields.Image as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                className="banner-slide__image"
            />
        </div>
    );

    return (
        <section
            className={`banner-slider-section component ${styles} ${isEditing ? 'sc-edit-mode' : ''}`.trim()}
            id={rawId}
        >
            {slides.length > 0 ? (
                isEditing ? (
                    // Edit mode: grid layout (no Swiper) so Sitecore DOM scripts can detect elements
                    <div className="banner-slider__edit-grid">
                        {slides.map((slide, index) => (
                            <div key={slide.id || index} className="banner-slider__edit-grid-item">
                                {renderSlideContent(slide, index)}
                            </div>
                        ))}
                    </div>
                ) : (
                    // Normal (view) mode: Swiper carousel
                    <Swiper
                        key={`banner-swiper-${locale}`}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        modules={[Navigation, Pagination, Autoplay]}
                        loop={true}
                        speed={600}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        navigation={{
                            prevEl: `.banner-swiper__prev-${containerId}`,
                            nextEl: `.banner-swiper__next-${containerId}`,
                        }}
                        pagination={{
                            el: `.banner-swiper__pagination-${containerId}`,
                            clickable: true,
                        }}
                        className="banner-swiper"
                    >
                        {slides.map((slide, index) => (
                            <SwiperSlide key={slide.id || index} className="banner-slide">
                                {renderSlideContent(slide, index)}
                            </SwiperSlide>
                        ))}

                        <button className={`banner-swiper__prev banner-swiper__prev-${containerId}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <button className={`banner-swiper__next banner-swiper__next-${containerId}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        <div className="banner-controls">
                            <div className="banner-controls__inner">
                                <div className={`banner-swiper__pagination banner-swiper__pagination-${containerId}`} />
                                <button className="banner-swiper__play-pause" onClick={togglePlayPause}>
                                    {isPlaying ? (
                                        <svg className="icon-pause" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                                            <rect x="5" y="3" width="4" height="18" rx="1" />
                                            <rect x="15" y="3" width="4" height="18" rx="1" />
                                        </svg>
                                    ) : (
                                        <svg className="icon-play" viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </Swiper>
                )
            ) : (
                <div className="banner-slide__edit-wrap">
                    <p style={{ textAlign: 'center', lineHeight: '150px', color: '#666' }}>
                        No Slide, Please click edit slide in Sitecore.
                    </p>
                </div>
            )}
        </section>
    );
};