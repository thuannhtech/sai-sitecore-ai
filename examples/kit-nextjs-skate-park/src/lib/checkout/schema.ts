import { z } from 'zod';

/**
 * Address Schema
 * Dùng chung cho Shipping và Billing
 */
export const AddressSchema = z.object({
  firstName: z.string().min(2, 'First name is too short'),
  lastName: z.string().min(2, 'Last name is too short'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  addressLine1: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  zipCode: z.string().min(5, 'Invalid Zip code'),
  country: z.string().min(2, 'Country is required'),
});

/**
 * Shipping Method Schema
 */
export const ShippingMethodSchema = z.object({
  id: z.string().min(1, 'Please select a shipping method'),
  name: z.string(),
  price: z.number(),
  time: z.string().optional(),
});

/**
 * Full Checkout Schema
 * Tổng hợp tất cả các bước
 */
export const CheckoutSchema = z.object({
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  billingSameAsShipping: z.boolean().default(true),
  shippingMethod: ShippingMethodSchema,
  paymentMethodId: z.string().min(1, 'Please select a payment method'),
});

export type AddressInfo = z.infer<typeof AddressSchema>;
export type ShippingMethodInfo = z.infer<typeof ShippingMethodSchema>;
export type CheckoutInfo = z.infer<typeof CheckoutSchema>;
