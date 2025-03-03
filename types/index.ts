/**
 *
 *
 */

import { z } from "zod"; // Imports Zod library for schema validation.
import { cartItemSchema, insertCartSchema, insertProductSchema, shippingAddressSchema } from "@/lib/validator"; // Imports Zod schemas for  product validation, cart, cart items, shipping

// Defines the TypeScript type for a product by inferring from the insertProductSchema and extending it with additional properties.
export type Product = z.infer<typeof insertProductSchema> & {
  id: string; // Adds an `id` property of type string.
  createdAt: Date; // Adds a `createdAt` property of type Date.
  rating: string; // Adds a `rating` property of type string.
  numReviews: number; // Adds a `numReviews` property of type number.
};

// Defines the TypeScript type for a cart by inferring from the insertCartSchema.
export type Cart = z.infer<typeof insertCartSchema>;

// Defines the TypeScript type for a cart item by inferring from the cartItemSchema.
export type CartItem = z.infer<typeof cartItemSchema>;

// Defines a TypeScript type `ShippingAddress` by inferring it from the `shippingAddressSchema`.
// This ensures that the `ShippingAddress` type matches the structure and validation rules defined in the `shippingAddressSchema`.
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
