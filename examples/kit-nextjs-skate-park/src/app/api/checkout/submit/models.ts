import { z } from 'zod';


export const CheckoutShippingMethodSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    price: z.number().nonnegative(),
    time: z.string().optional().nullable(),
  })
  .passthrough();

export const CheckoutPaymentMethodSchema = z
  .object({
    id: z.string().min(1),
    itemId: z.string().optional().default(''),
  })
  .passthrough();

export const CheckoutTransactionSchema = z
  .object({
    nonce: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    deviceData: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    binData: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough()
  .nullable()
  .optional();

export const CheckoutCartItemSchema = z
  .object({
    id: z.string().min(1),
    productId: z.string().min(1),
    name: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    lineTotal: z.number().nonnegative(),
    imageUrl: z.string().optional(),
  })
  .passthrough();

export const CheckoutCartSchema = z
  .object({
    id: z.string().optional().default(''),
    items: z.array(CheckoutCartItemSchema).min(1),
    subtotal: z.number().nonnegative(),
    promotionDiscount: z.number().nonnegative().optional().default(0),
    discountedSubtotal: z.number().nonnegative().optional().default(0),
    shippingAmount: z.number().nonnegative().optional().default(0),
    taxRate: z.number().nonnegative().optional().default(0),
    taxRatePercentage: z.number().nonnegative().optional().default(0),
    taxAmount: z.number().nonnegative().optional().default(0),
    total: z.number().nonnegative().optional().default(0),
    itemCount: z.number().int().nonnegative(),
  })
  .passthrough();

export const CheckoutSubmitRequestSchema = z
  .object({
    shippingMethod: CheckoutShippingMethodSchema,
    paymentMethod: CheckoutPaymentMethodSchema,
    transaction: CheckoutTransactionSchema,
    cart: CheckoutCartSchema,
  })
  .passthrough();

export type CheckoutSubmitRequest = z.infer<typeof CheckoutSubmitRequestSchema>;

export type CheckoutSubmitResponse =
  | {
      success: true;
      orderId: string;
      redirectUrl: string;
      orderCloud: {
        orderId: string;
        status?: string;
        total?: number;
        subtotal?: number;
      };
    }
  | {
      success: false;
      message: string;
      details?: unknown;
    };

export type CheckoutSubmitOrderSnapshot = CheckoutSubmitRequest & {
  orderId: string;
  sourceOrderId?: string;
  orderCloudOrderId: string;
  submittedAt: string;
  status?: string;
  totals?: {
    subtotal?: number;
    shipping?: number;
    tax?: number;
    total?: number;
  };
  payment?: {
    id?: string;
    type?: string;
    accepted?: boolean;
    transactionId?: string;
    status?: string;
  };
};
