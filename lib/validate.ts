import { z } from "zod";

export const CartItemSchema = z.object({
  sku: z.enum(["PHYTO_16OZ", "PHYTO_32OZ"]),
  name: z.string().min(1),
  qty: z.number().int().min(1).max(20),
  unit_amount: z.number().int().min(1), // cents
});

export const AddressSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(5).optional(),
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  city_locality: z.string().min(1),
  state_province: z.string().min(1),
  postal_code: z.string().min(3),
  country_code: z.string().min(2).max(2).default("US"),
  email: z.string().email().optional(),
});

export const QuoteBodySchema = z.object({
  items: z.array(CartItemSchema).min(1),
  address: AddressSchema,
});

export const SelectBodySchema = z.object({
  quote_key: z.string().min(10),
  selected_rate_id: z.string().min(3),
});

export const CheckoutCreateBodySchema = z.object({
  quote_key: z.string().min(10),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
});