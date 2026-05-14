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
    itemCount: z.number(),
  }),
});

export type OrderPlacementRequest = z.infer<typeof OrderPlacementRequestSchema>;

export interface OrderPlacementResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  redirectUrl?: string;
  submittedOrder?: any;
  paymentSummary: {
    type: string;
    transactionId?: string;
  };
}
