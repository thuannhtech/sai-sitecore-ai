'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    id: 1,
    title: 'Women',
    description: 'Experience the best in sportswear with our latest collection.',
    image: '/assets/images/main-slider/5.jpg',
    ctaLabel: 'Shop now',
    ctaLink: '/shop?gender=women',
    align: 'left',
  },
  {
    id: 2,
    title: 'Men',
    description: 'Discover the latest trends in Men\'s sportswear and casual fashion.',
    image: '/assets/images/main-slider/2.png',
    ctaLabel: 'Shop now',
    ctaLink: '/shop?gender=men',
    align: 'left',
  },
  {
    id: 3,
    title: 'Accessories',
    description: 'Elevate your style with our latest sportswear collection.',
    image: '/assets/images/main-slider/4.jpg',
    ctaLabel: 'Shop now',
    ctaLink: '/shop?category=accessories',
    align: 'left',
  },
];

export const TailstoreHeroSlider: React.FC = () => {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-gray-dark">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative w-full h-full">
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={slide.id === 1}
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Content Container */}
            <div className="container mx-auto px-4 h-full relative z-10 flex items-center">
              <div className="max-w-2xl text-white">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h2 className="text-4xl md:text-7xl font-extrabold mb-4 leading-tight drop-shadow-lg">
                    {slide.title}
                  </h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <p className="text-xl md:text-2xl mb-8 font-medium text-white/90 drop-shadow-md">
                    {slide.description}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Link
                    href={slide.ctaLink}
                    className="inline-block bg-primary hover:bg-white text-white hover:text-primary font-bold px-10 py-4 rounded-full border-2 border-transparent hover:border-primary transition-all duration-300 shadow-xl"
                  >
                    {slide.ctaLabel}
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: white;
          background: rgba(0,0,0,0.2);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 20px;
          font-weight: bold;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #ff0042;
          transform: scale(1.1);
        }
        .swiper-pagination-bullet {
          background: rgba(255,255,255,0.5);
          width: 12px;
          height: 12px;
          opacity: 1;
        }
        .swiper-pagination-bullet-active {
          background: #ff0042;
          width: 30px;
          border-radius: 10px;
        }
      `}</style>
    </section>
  );
};
