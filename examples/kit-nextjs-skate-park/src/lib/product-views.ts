/**
 * Real-time Local Activity Tracker for Views & Purchases.
 * NOTE: Sitecore Search Discover API does not store raw view/purchase counts in product document schemas.
 * This helper only tracks actual visitor actions in the browser via localStorage without any hardcoded mocks.
 */

const STORAGE_VIEWS_KEY = 'sai_product_views';
const STORAGE_PURCHASES_KEY = 'sai_product_purchases';

function getStorageMap(key: string): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLocalViews(): Record<string, number> {
  return getStorageMap(STORAGE_VIEWS_KEY);
}

export function getLocalPurchases(): Record<string, number> {
  return getStorageMap(STORAGE_PURCHASES_KEY);
}

export function recordProductView(productId?: string, productName?: string): number {
  if (typeof window === 'undefined' || (!productId && !productName)) return 0;
  try {
    const views = getLocalViews();
    const key = (productName || productId || '').trim();
    const next = (views[key] || 0) + 1;
    views[key] = next;
    if (productId && productId !== key) {
      views[productId] = (views[productId] || 0) + 1;
    }
    localStorage.setItem(STORAGE_VIEWS_KEY, JSON.stringify(views));
    return next;
  } catch {
    return 0;
  }
}

export function recordProductPurchase(productId?: string, productName?: string): number {
  if (typeof window === 'undefined' || (!productId && !productName)) return 0;
  try {
    const purchases = getLocalPurchases();
    const key = (productName || productId || '').trim();
    const next = (purchases[key] || 0) + 1;
    purchases[key] = next;
    if (productId && productId !== key) {
      purchases[productId] = (purchases[productId] || 0) + 1;
    }
    localStorage.setItem(STORAGE_PURCHASES_KEY, JSON.stringify(purchases));
    return next;
  } catch {
    return 0;
  }
}

export function getProductViewCount(item: { id?: string; name?: string }): number {
  const name = (item.name || '').trim();
  const id = (item.id || '').trim();
  const local = getLocalViews();
  return local[name] || local[id] || 0;
}

export function getProductPurchaseCount(item: { id?: string; name?: string }): number {
  const name = (item.name || '').trim();
  const id = (item.id || '').trim();
  const local = getLocalPurchases();
  return local[name] || local[id] || 0;
}
