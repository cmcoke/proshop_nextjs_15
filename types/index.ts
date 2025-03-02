/**
 * This block of code defines TypeScript types for a product, cart, and cart items using Zod schemas.
 * - It imports Zod schemas for validation.
 * - Uses `z.infer` to create TypeScript types based on the Zod schemas.
 * - Extends the product type with additional properties.
 */

import { z } from "zod"; // Imports Zod library for schema validation.
import { cartItemSchema, insertCartSchema, insertProductSchema } from "@/lib/validator"; // Imports Zod schemas for cart items, cart, and product validation.

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
