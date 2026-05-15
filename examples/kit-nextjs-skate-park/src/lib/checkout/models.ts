import { z } from 'zod';

/**
 * Frontend Payload Schema (from checkout.js)
 */
export const OrderPlacementRequestSchema = z.object({
  shippingMethod: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
  }),
  paymentMethod: z.object({
    id: z.string(),
    itemId: z.string().optional(),
  }),
  transaction: z.object({
    nonce: z.string(),
    details: z.any().optional(),
    type: z.string().optional(),
    deviceData: z.string().optional(),
  }).optional(),
  cart: z.object({
    id: z.string(),
    items: z.array(z.any()),
    subtotal: z.number(),
    promotionDiscount: z.number().optional().default(0),
    discountedSubtotal: z.number().optional().default(0),
    shippingAmount: z.number().optional().default(0),
    taxRate: z.number().optional().default(0),
    taxRatePercentage: z.number().optional().default(0),
    taxAmount: z.number().optional().default(0),
    total: z.number().optional().default(0),
    itemCount: z.number(),
  }),
});

export type OrderPlacementRequest = z.infer<typeof OrderPlacementRequestSchema>;

export interface OrderViewModelItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface OrderViewModelAddress {
  FullName?: string;
  Address?: string;
  PhoneNumber?: string;
}

export interface OrderViewModelShippingMethod {
  id?: string;
  name?: string;
  time?: string;
  price?: number;
}

export interface OrderViewModelPaymentMethod {
  id?: string;
  label?: string;
  provider?: string;
  cardType?: string;
  last4?: string;
  status?: string;
}

export interface OrderViewModelCart {
  items?: OrderViewModelItem[];
  subtotal?: number;
  shippingCost?: number;
  taxCost?: number;
  promotionDiscount?: number;
  total?: number;
  gstRate?: number;
}

export interface OrderViewModel {
  orderId: string;
  orderDate?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
  shippingAddress?: OrderViewModelAddress;
  shippingMethod?: OrderViewModelShippingMethod;
  paymentMethod?: OrderViewModelPaymentMethod;
  cart?: OrderViewModelCart;
}

export interface OrderPlacementResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  redirectUrl?: string;
  submittedOrder?: unknown;
  paymentSummary: {
    type: string;
    transactionId?: string;
    success?: boolean;
  };
}
