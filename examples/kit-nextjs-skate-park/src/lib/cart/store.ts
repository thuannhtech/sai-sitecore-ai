import { create } from 'zustand';
import { SkateCart, SkateProduct } from './types';
import { mockCartService } from './mockService';

interface SkateCartState {
  cart: SkateCart | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setIsOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (product: SkateProduct, quantity: number) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
}

export const useSkateCartStore = create<SkateCartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  error: null,

  setIsOpen: (open: boolean) => set({ isOpen: open }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await mockCartService.getCart();
      set({ cart, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch cart', isLoading: false });
    }
  },

  addToCart: async (product: SkateProduct, quantity: number) => {
    set({ isLoading: true });
    try {
      const cart = await mockCartService.addToCart(product, quantity);
      set({ cart, isLoading: false, isOpen: true }); // Mở mini cart khi add thành công
    } catch (err) {
      set({ error: 'Failed to add to cart', isLoading: false });
    }
  },

  updateQuantity: async (lineItemId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const cart = await mockCartService.updateQuantity(lineItemId, quantity);
      set({ cart, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to update quantity', isLoading: false });
    }
  },

  removeItem: async (lineItemId: string) => {
    set({ isLoading: true });
    try {
      const cart = await mockCartService.removeItem(lineItemId);
      set({ cart, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to remove item', isLoading: false });
    }
  },
}));
