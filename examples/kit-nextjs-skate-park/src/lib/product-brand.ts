/**
 * Utility helper to extract Brand (Intel or AMD) from product metadata
 */
export function getProductBrand(item?: {
  brand?: string;
  category_names?: string | string[];
  name?: string;
  modelName?: string;
  slug?: string;
}): 'Intel' | 'AMD' | string {
  if (item?.brand) {
    if (item.brand.toLowerCase().includes('intel')) return 'Intel';
    if (item.brand.toLowerCase().includes('amd')) return 'AMD';
    return item.brand;
  }

  const cats = Array.isArray(item?.category_names)
    ? item.category_names.join(' ')
    : item?.category_names || '';
  if (cats.toLowerCase().includes('intel')) return 'Intel';
  if (cats.toLowerCase().includes('amd')) return 'AMD';

  const name = (item?.modelName || item?.name || item?.slug || '').toLowerCase();
  if (name.includes('intel')) return 'Intel';
  if (name.includes('amd')) return 'AMD';
  if (name.includes('poc_101') || name.includes('poc-101') || name.includes('poc_103') || name.includes('poc-103')) return 'Intel';

  return 'AMD';
}
