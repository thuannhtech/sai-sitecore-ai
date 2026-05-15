import { create } from 'zustand';
import { SkateCart, SkateLineItem, SkateProduct } from './types';

const CART_API_URL = '/api/cart';
const CART_LINE_ITEMS_API_URL = '/api/cart/line-items';
const CART_PROMOTIONS_API_URL = '/api/cart/promotions';
const CART_STORAGE_KEY = 'cart_data';
const CART_STORAGE_TTL = 20 * 60 * 1000; // 20 minutes

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
  initializeCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  addToCart: (product: SkateProduct, quantity: number) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  applyPromotion: (code: string) => Promise<void>;
  clearCart: () => void;
}

type CartApiRecord = Record<string, unknown>;

const handleCartApiResponse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Cart API request failed');
  }

  return payload;
};

const asRecord = (value: unknown): CartApiRecord =>
  value && typeof value === 'object' ? (value as CartApiRecord) : {};

const asNumber = (value: unknown) => (typeof value === 'number' ? value : 0);

const asString = (value: unknown) => (typeof value === 'string' ? value : '');
const asNumberOrFallback = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const mapCartResponse = (data: unknown): SkateCart => {
  const dataRecord = asRecord(data);
  const cartRecord = asRecord(dataRecord.cart);
  const cartXpRecord = asRecord(cartRecord.xp);
  const lineItems = Array.isArray(dataRecord.items) ? dataRecord.items : [];

  const items: SkateLineItem[] = lineItems.map((lineItem) => {
    const lineItemRecord = asRecord(lineItem);
    const productRecord = asRecord(lineItemRecord.Product);
    const quantity = asNumber(lineItemRecord.Quantity);
    const unitPrice = asNumber(lineItemRecord.UnitPrice);

    return {
      id: asString(lineItemRecord.ID) || asString(lineItemRecord.id),
      productId: asString(lineItemRecord.ProductID) || asString(lineItemRecord.productId),
    name:
      asString(productRecord.Name) ||
      asString(lineItemRecord.productName) ||
      asString(lineItemRecord.Name) ||
      asString(lineItemRecord.ProductID) ||
      'Product',
    quantity,
    unitPrice,
    lineTotal: asNumber(lineItemRecord.LineTotal) || (quantity && unitPrice ? quantity * unitPrice : 0),
    imageUrl:
      lineItem.xp?.ImageUrl ??
      lineItem.Product?.xp?.ImageUrl ??
      lineItem.Product?.DefaultImageUrl ??
      lineItem.Product?.ImageUrl ??
      lineItem.ImageUrl ??
      undefined,
    };
  });

  const derivedSubtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = asNumber(cartRecord.Subtotal) || asNumber(cartRecord.subtotal) || derivedSubtotal;
  const promotionDiscount =
    asNumber(cartRecord.PromotionDiscount) || asNumber(cartRecord.promotionDiscount);
  const shippingCost =
    asNumberOrFallback(cartXpRecord.ShippingCost, asNumberOrFallback(cartRecord.ShippingCost, 0));
  const total =
    asNumber(cartRecord.Total) ||
    asNumber(cartRecord.total) ||
    Math.max(subtotal - promotionDiscount, 0);

  return {
    id: asString(cartRecord.ID) || asString(cartRecord.id) || 'cart',
    items,
    subtotal,
    promotionDiscount,
    shippingCost,
    shippingMethod: cartXpRecord.ShippingMethodID
      ? {
          id: asString(cartXpRecord.ShippingMethodID),
          name: asString(cartXpRecord.ShippingMethodName),
          time: asString(cartXpRecord.ShippingMethodTime),
        }
      : undefined,
    total,
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

type StoredCart = {
  cart: SkateCart;
  updatedAt: number;
};

const getStoredCart = (): SkateCart | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(CART_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as StoredCart;

    if (!parsed?.cart || typeof parsed.updatedAt !== 'number') {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.updatedAt > CART_STORAGE_TTL) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return null;
    }

    return parsed.cart;
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY);
    return null;
  }
};

const persistCart = (cart: SkateCart | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!cart) {
    localStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  const payload: StoredCart = {
    cart,
    updatedAt: Date.now(),
  };

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
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

  initializeCart: async () => {
    const storedCart = getStoredCart();

    if (storedCart) {
      set({ cart: storedCart, isLoading: false, error: null });
      return;
    }

    await get().fetchCart();
  },

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const cart = await fetchCartFromApi();
      persistCart(cart);
      set({ cart, isLoading: false });
    } catch {
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
      persistCart(cart);
      set({ cart, isLoading: false, isOpen: true });
    } catch {
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
      persistCart(cart);
      set({ cart, isProcessing: false, processingLineItemId: null, processingAction: null });
    } catch {
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
      persistCart(cart);
      set({ cart, isProcessing: false, processingLineItemId: null, processingAction: null });
    } catch {
      set({ error: 'Failed to remove item', isProcessing: false, processingLineItemId: null, processingAction: null });
    }
  },

  applyPromotion: async (code: string) => {
    set({ isProcessing: true, processingLineItemId: null, processingAction: null, error: null });
    try {
      const response = await fetch(CART_PROMOTIONS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const payload = await handleCartApiResponse(response);
      const cart = mapCartResponse(payload);
      persistCart(cart);
      set({ cart, isProcessing: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply promo code';
      set({ error: message, isProcessing: false });
      throw error;
    }
  },

  clearCart: () => {
    set({ cart: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  },
}));

// Export store for external JS (Sitecore scripts)
if (typeof window !== 'undefined') {
  (window as Window & { SkateCartStore?: typeof useSkateCartStore }).SkateCartStore = useSkateCartStore;
}
