import { create } from 'zustand';
import { SkateCart, SkateLineItem, SkateProduct } from './types';
import { Order, LineItem } from 'src/lib/ordercloud';

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
  clearCart: () => void;
}

// Helper to map OrderCloud Order + LineItems to SkateCart
const mapToSkateCart = (ocOrder: Order, ocItems: LineItem[]): SkateCart => {
  return {
    id: ocOrder.ID!,
    itemCount: ocItems.reduce((sum, item) => sum + (item.Quantity || 0), 0),
    subtotal: ocOrder.Total || 0,
    items: ocItems.map((item) => ({
      id: item.ID!,
      productId: item.ProductID!,
      name: item.xp?.ProductName || item.ProductID!, // Using xp or ProductID as fallback
      quantity: item.Quantity || 0,
      unitPrice: item.UnitPrice || 0,
      lineTotal: item.LineTotal || 0,
      imageUrl: item.xp?.ImageUrl || '/images/product-placeholder.png', // Using xp or placeholder
    })),
  };
};

export const useSkateCartStore = create<SkateCartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  error: null,

  setIsOpen: (open: boolean) => set({ isOpen: open }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch cart');

      if (data.cart) {
        set({ cart: mapToSkateCart(data.cart, data.items || []), isLoading: false });
      } else {
        set({ cart: null, isLoading: false });
      }
    } catch (err: any) {
      console.error('Fetch cart error:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addToCart: async (product: SkateProduct, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/cart/line-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ProductID: product.id, 
          Quantity: quantity,
          // We can pass extra data in xp if needed by the backend
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add to cart');

      // Refresh cart after adding
      await get().fetchCart();
      set({ isOpen: true }); // Open mini cart on success
    } catch (err: any) {
      console.error('Add to cart error:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  updateQuantity: async (lineItemId: string, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/cart/line-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LineItemID: lineItemId, Quantity: quantity }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update quantity');

      // Refresh cart
      await get().fetchCart();
    } catch (err: any) {
      console.error('Update quantity error:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  removeItem: async (lineItemId: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/cart/line-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LineItemID: lineItemId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove item');

      // Refresh cart
      await get().fetchCart();
    } catch (err: any) {
      console.error('Remove item error:', err);
      set({ error: err.message, isLoading: false });
    }
  },
  
  clearCart: () => {
    set({ cart: null });
    // No need to clear localStorage as we're using server-side cookies now
  },
}));

// Export store for external JS (Sitecore scripts)
if (typeof window !== 'undefined') {
  (window as any).SkateCartStore = useSkateCartStore;
}
