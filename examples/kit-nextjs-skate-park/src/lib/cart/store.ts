import { create } from 'zustand';
import { SkateCart, SkateLineItem, SkateProduct } from './types';

const CART_API_URL = '/api/cart';
const CART_LINE_ITEMS_API_URL = '/api/cart/line-items';

interface SkateCartState {
  cart: SkateCart | null;
  isOpen: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  processingLineItemId: string | null;
  processingAction: 'update' | 'remove' | 'fetch' | null;
  error: string | null;

  // Actions
  setIsOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (product: SkateProduct, quantity: number) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clearCart: () => void;
}

const handleCartApiResponse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Cart API request failed');
  }

  return payload;
};

const mapCartResponse = (data: any): SkateCart => {
  const lineItems = Array.isArray(data?.items) ? data.items : [];

  const items: SkateLineItem[] = lineItems.map((lineItem: any) => ({
    id: lineItem.ID ?? lineItem.id ?? '',
    productId: lineItem.ProductID ?? lineItem.productId ?? '',
    name:
      lineItem.Product?.Name ??
      lineItem.Product?.Name ??
      lineItem.productName ??
      lineItem.Name ??
      lineItem.ProductID ??
      'Product',
    quantity: lineItem.Quantity ?? 0,
    unitPrice: lineItem.UnitPrice ?? 0,
    lineTotal:
      lineItem.LineTotal ??
      (lineItem.Quantity && lineItem.UnitPrice ? lineItem.Quantity * lineItem.UnitPrice : 0),
    imageUrl:
      lineItem.xp?.ImageUrl ??
      lineItem.Product?.xp?.ImageUrl ??
      lineItem.Product?.DefaultImageUrl ??
      lineItem.Product?.ImageUrl ??
      lineItem.ImageUrl ??
      undefined,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: data?.cart?.ID ?? data?.cart?.id ?? 'cart',
    items,
    subtotal,
    itemCount,
  };
};

const fetchCartFromApi = async (): Promise<SkateCart> => {
  const response = await fetch(CART_API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const payload = await handleCartApiResponse(response);
  return mapCartResponse(payload);
};

export const useSkateCartStore = create<SkateCartState>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  isProcessing: false,
  processingLineItemId: null,
  processingAction: null,
  error: null,

  setIsOpen: (open: boolean) => set({ isOpen: open }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await fetchCartFromApi();
      set({ cart, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch cart', isLoading: false });
    }
  },

  addToCart: async (product: SkateProduct, quantity: number) => {
    set({ isLoading: true });
    try {
      const response = await fetch(CART_LINE_ITEMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ProductID: product.orderCloudId ?? product.id,
          Quantity: quantity,
          ImageUrl: product.imageUrl,
        }),
      });

      await handleCartApiResponse(response);
      const cart = await fetchCartFromApi();
      set({ cart, isLoading: false, isOpen: true });
    } catch (err) {
      set({ error: 'Failed to add to cart', isLoading: false });
    }
  },

  updateQuantity: async (lineItemId: string, quantity: number) => {
    set({ isProcessing: true, processingLineItemId: lineItemId, processingAction: 'update' });
    try {
      const response = await fetch(CART_LINE_ITEMS_API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          LineItemID: lineItemId,
          Quantity: quantity,
        }),
      });

      await handleCartApiResponse(response);
      const cart = await fetchCartFromApi();
      set({ cart, isProcessing: false, processingLineItemId: null, processingAction: null });
    } catch (err) {
      set({ error: 'Failed to update quantity', isProcessing: false, processingLineItemId: null, processingAction: null });
    }
  },

  removeItem: async (lineItemId: string) => {
    set({ isProcessing: true, processingLineItemId: lineItemId, processingAction: 'remove' });
    try {
      const response = await fetch(CART_LINE_ITEMS_API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          LineItemID: lineItemId,
        }),
      });

      await handleCartApiResponse(response);
      const cart = await fetchCartFromApi();
      set({ cart, isProcessing: false, processingLineItemId: null, processingAction: null });
    } catch (err) {
      set({ error: 'Failed to remove item', isProcessing: false, processingLineItemId: null, processingAction: null });
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
