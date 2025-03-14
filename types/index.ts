/**
 *
 *
 */

import { z } from "zod"; // Imports Zod library for schema validation.
import { cartItemSchema, insertCartSchema, insertProductSchema, shippingAddressSchema, insertOrderItemSchema, insertOrderSchema, paymentResultSchema, insertReviewSchema } from "@/lib/validator";

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

// Defines a TypeScript type 'OrderItem' based on the Zod schema 'insertOrderItemSchema'.
// The 'z.infer<typeof insertOrderItemSchema>' ensures that the OrderItem type has the same structure and constraints as defined in the insertOrderItemSchema Zod schema.
export type OrderItem = z.infer<typeof insertOrderItemSchema>;

// Defines a TypeScript type 'Order' based on the Zod schema 'insertOrderSchema' and extends it with additional fields.
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string; // Adds an 'id' field of type string to the Order type.
  createdAt: Date; // Adds a 'createdAt' field of type Date to the Order type.
  isPaid: boolean; // Adds an 'isPaid' field of type boolean to the Order type.
  paidAt: Date | null; // Adds a 'paidAt' field of type Date or null to the Order type.
  isDelivered: boolean; // Adds an 'isDelivered' field of type boolean to the Order type.
  deliveredAt: Date | null; // Adds a 'deliveredAt' field of type Date or null to the Order type.
  orderitems: OrderItem[]; // Adds an 'orderitems' field which is an array of OrderItem type to the Order type.
  user: { name: string; email: string }; // Adds a 'user' field which is an object containing 'name' and 'email' fields of type string to the Order type.
};

// Defines a TypeScript type 'PaymentResult' based on the Zod schema 'paymentResultSchema'.
// The 'z.infer<typeof paymentResultSchema>' ensures that the PaymentResult type has the same structure and constraints as defined in the paymentResultSchema Zod schema.
export type PaymentResult = z.infer<typeof paymentResultSchema>;

/**
 * Defines a TypeScript type "Review" by inferring the structure from "insertReviewSchema".
 * The "& { ... }" part extends the inferred type by adding additional fields.
 */
export type Review = z.infer<typeof insertReviewSchema> & {
  id: string; // Unique identifier for the review, stored as a string.
  createdAt: Date; // Timestamp indicating when the review was created.
  user?: { name: string }; // Optional field (denoted by "?") representing user details. It includes a nested object with a "name" property as a string.
};
