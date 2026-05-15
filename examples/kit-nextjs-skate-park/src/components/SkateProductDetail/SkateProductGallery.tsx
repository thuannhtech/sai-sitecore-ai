'use client';

import React, { useState } from 'react';

interface SkateProductGalleryProps {
  images: string[];
  modelName?: string;
}

export const SkateProductGallery = ({ images, modelName }: SkateProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="space-y-6">
        <div className="aspect-[4/5] sm:aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner flex flex-col items-center justify-center text-gray-300 gap-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-sm font-medium">No Image Available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main image */}
      <div className="aspect-[4/5] sm:aspect-square bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-inner group relative">
        <img
          src={images[selectedIndex]}
          alt={modelName ?? 'Product image'}
          className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
        />
        {/* Image counter badge */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {selectedIndex + 1} / {Math.min(images.length, 4)}
          </div>
        )}
      </div>

      {/* Thumbnail list */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4 px-2">
          {images.slice(0, 4).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer focus:outline-none ${
                i === selectedIndex
                  ? 'border-blue-500 ring-2 ring-blue-100 scale-95'
                  : 'border-gray-100 hover:border-gray-300 hover:scale-95 opacity-70 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={img}
                className="w-full h-full object-cover"
                alt={`${modelName ?? 'Product'} thumbnail ${i + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
