'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const TailstorePromoBanner: React.FC = () => {
  return (
    <section className="relative my-20">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative min-h-[400px] md:min-h-[500px] rounded-3xl overflow-hidden flex items-center justify-center text-center shadow-2xl"
        >
          {/* Background Image with Parallax-like effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed transition-transform duration-1000"
            style={{ backgroundImage: "url('/assets/images/banner1.jpg')" }}
          />
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Content */}
          <div className="relative z-10 px-4 max-w-3xl">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight"
            >
              Welcome to Our Shop
            </motion.h2>
            
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/shop"
                className="bg-primary hover:bg-white text-white hover:text-primary font-bold px-8 py-4 rounded-full border-2 border-transparent hover:border-primary transition-all duration-300 min-w-[160px] shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                href="/shop?sort=newest"
                className="bg-white/20 hover:bg-white text-white hover:text-gray-dark font-bold px-8 py-4 rounded-full border-2 border-white/30 hover:border-white backdrop-blur-md transition-all duration-300 min-w-[160px]"
              >
                New Arrivals
              </Link>
              <Link
                href="/shop?on-sale=true"
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-dark font-bold px-8 py-4 rounded-full border-2 border-transparent transition-all duration-300 min-w-[160px] shadow-lg"
              >
                Sale
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
