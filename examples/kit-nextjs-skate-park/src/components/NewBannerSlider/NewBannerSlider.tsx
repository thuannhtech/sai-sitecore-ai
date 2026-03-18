"use client";
import React, { useRef, useState } from 'react';
import {
    Placeholder
} from '@sitecore-content-sdk/nextjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Props = {
    rendering: any;
    params?: any;
    page?: any;
};

export const Default = (props: Props) => {
    const { rendering, params = {}, page } = props;
    const placeholderName = `banner-slides-${rendering.uid}`;
    const [isPlaying, setIsPlaying] = useState(true);
    const swiperRef = useRef<any>(null);

    const isEditing = page?.mode?.isEditing || false;

    // Params do Editor cấu hình ở giao diện lưới
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

    return (
        <section className={`banner-slider-section component ${styles} ${isEditing ? 'sc-edit-mode' : ''}`} id={rawId}>
            <Placeholder
                name='banner-slides'
                rendering={rendering}
                render={(components) =>
                    components.length > 0 ? (
                        isEditing ? (
                            // Chế độ Edit: Vô hiệu hóa tính năng Swiper Slider để Sitecore Scripts bắt được DOM Element dễ dàng
                            <div className="banner-swiper sc-edit-mode">
                                <div className="swiper-wrapper sc-edit-mode">
                                    {components.map((component, index) => (
                                        <div key={index} className="swiper-slide banner-slide">
                                            {component}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Chế độ người xem (Normal Mode): Mở Swiper Slider
                            <Swiper
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
                                {components.map((component, index) => (
                                    <SwiperSlide key={index} className="banner-slide">
                                        {component}
                                    </SwiperSlide>
                                ))}

                                <button className={`banner-swiper__prev banner-swiper__prev-${containerId}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                </button>
                                <button className={`banner-swiper__next banner-swiper__next-${containerId}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </button>

                                <div className="banner-controls">
                                    <div className="banner-controls__inner">
                                        <div className={`banner-swiper__pagination banner-swiper__pagination-${containerId}`}></div>
                                        <button className="banner-swiper__play-pause" onClick={togglePlayPause}>
                                            {isPlaying ? (
                                                <svg className="icon-pause" viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><rect x="5" y="3" width="4" height="18" rx="1" /><rect x="15" y="3" width="4" height="18" rx="1" /></svg>
                                            ) : (
                                                <svg className="icon-play" viewBox="0 0 24 24" fill="currentColor" width="13" height="13"><path d="M8 5v14l11-7z" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </Swiper>
                        )
                    ) : (
                        <div className="banner-slide__edit-wrap">
                            <p style={{ textAlign: "center", lineHeight: "150px", color: "#666" }}>
                                No Slide, Please click edit slide in Sitecore.
                            </p>
                        </div>
                    )
                }
            />
        </section>
    );
};