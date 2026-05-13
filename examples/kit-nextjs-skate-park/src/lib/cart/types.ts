export interface SkateProduct {
  id: string;
  orderCloudId?: string;
  name: string;
  price: number;
  imageUrl?: string;
  slug?: string;
}

export interface SkateLineItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface SkateCart {
  id: string;
  items: SkateLineItem[];
  subtotal: number;
  itemCount: number;
}
