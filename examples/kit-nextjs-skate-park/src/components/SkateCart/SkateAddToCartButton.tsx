'use client';

import React from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useSkateCartStore } from 'src/lib/cart/store';
import { SkateProduct } from 'src/lib/cart/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkateAddToCartButtonProps {
  product: SkateProduct;
  quantity?: number;
  className?: string;
}

export const SkateAddToCartButton: React.FC<SkateAddToCartButtonProps> = ({
  product,
  quantity = 1,
  className,
}) => {
  const { addToCart } = useSkateCartStore();
  const [isLocalLoading, setIsLocalLoading] = React.useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLocalLoading(true);
    try {
      await addToCart(product, quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsLocalLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLocalLoading}
      className={cn(
        'group relative flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70',
        className
      )}
    >
      {isLocalLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
      )}
      <span>Add to Cart</span>
    </button>
  );
};
