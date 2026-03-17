'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const categories = [
  {
    title: 'Men',
    image: '/assets/images/cat-image1.jpg',
    href: '/shop?gender=men',
  },
  {
    title: 'Women',
    image: '/assets/images/cat-image4.jpg',
    href: '/shop?gender=women',
  },
  {
    title: 'Accessories',
    image: '/assets/images/cat-image5.jpg',
    href: '/shop?category=accessories',
  },
];

export const TailstoreCategoryBanners: React.FC = () => {
  return (
    <section className="py-20 bg-gray-lighter">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group overflow-hidden rounded-2xl shadow-xl aspect-[4/5]"
            >
              {/* Image */}
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gray-dark/40 group-hover:bg-gray-dark/20 transition-colors duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white text-center">
                <motion.h2 
                  className="text-3xl md:text-4xl font-extrabold mb-6 drop-shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  {cat.title}
                </motion.h2>
                <Link
                  href={cat.href}
                  className="bg-primary hover:bg-white text-white hover:text-primary font-bold px-8 py-3 rounded-full border-2 border-transparent hover:border-primary transition-all duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  Shop now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
