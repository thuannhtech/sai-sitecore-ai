import { SkateCart, SkateLineItem, SkateProduct } from './types';

const MOCK_DELAY = 800;
const STORAGE_KEY = 'skate_mock_cart';

const createEmptyCart = (): SkateCart => ({
  id: 'mock-order-123',
  items: [],
  subtotal: 0,
  promotionDiscount: 0,
  shippingCost: 0,
  total: 0,
  itemCount: 0,
});

const syncCartTotals = (cart: SkateCart) => {
  cart.subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
  cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.total = Math.max(cart.subtotal - cart.promotionDiscount, 0) + cart.shippingCost;
  return cart;
};

// Hàm helper để đọc/ghi localStorage an toàn
const getStorageCart = (): SkateCart => {
  if (typeof window === 'undefined') return createEmptyCart();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? syncCartTotals(JSON.parse(stored)) : createEmptyCart();
};

const setStorageCart = (cart: SkateCart) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }
};

export const mockCartService = {
  getCart: async (): Promise<SkateCart> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    return getStorageCart();
  },

  addToCart: async (product: SkateProduct, quantity: number): Promise<SkateCart> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    
    const mockCart = getStorageCart();
    const existingItem = mockCart.items.find((item) => item.productId === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.lineTotal = existingItem.quantity * existingItem.unitPrice;
    } else {
      const newItem: SkateLineItem = {
        id: `li-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        name: product.name,
        quantity: quantity,
        unitPrice: product.price,
        lineTotal: product.price * quantity,
        imageUrl: product.imageUrl,
      };
      mockCart.items.push(newItem);
    }

    syncCartTotals(mockCart);
    setStorageCart(mockCart);
    return mockCart;
  },

  updateQuantity: async (lineItemId: string, quantity: number): Promise<SkateCart> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));

    const mockCart = getStorageCart();
    const item = mockCart.items.find((i) => i.id === lineItemId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      item.lineTotal = item.quantity * item.unitPrice;
      if (item.quantity <= 0) {
        mockCart.items = mockCart.items.filter((i) => i.id !== lineItemId);
      }
    }

    syncCartTotals(mockCart);
    setStorageCart(mockCart);
    return mockCart;
  },

  removeItem: async (lineItemId: string): Promise<SkateCart> => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
    
    const mockCart = getStorageCart();
    mockCart.items = mockCart.items.filter((i) => i.id !== lineItemId);
    
    syncCartTotals(mockCart);
    setStorageCart(mockCart);
    return mockCart;
  },
};
