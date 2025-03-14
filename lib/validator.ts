/**
 *
 *
 */

import { z } from "zod"; // Imports the Zod library for creating schemas and validating data structures.
import { formatNumberWithDecimal } from "./utils"; // Imports a utility function to format numbers with two decimal places.
import { PAYMENT_METHODS } from "./constants"; // Imports the PAYMENT_METHODS array from the constants file.

// Validates that the price is a string formatted with exactly two decimal places.
const currency = z.string().refine(value => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), "Price must have exactly two decimal places (e.g., 49.99)");

// Defines the schema for inserting a product into the system.
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"), // Ensures the product name is a string and has at least 3 characters.
  slug: z.string().min(3, "Slug must be at least 3 characters"), // Ensures the product slug is a string and has at least 3 characters.
  category: z.string().min(3, "Category must be at least 3 characters"), // Ensures the category is a string and has at least 3 characters.
  brand: z.string().min(3, "Brand must be at least 3 characters"), // Ensures the brand is a string and has at least 3 characters.
  description: z.string().min(3, "Description must be at least 3 characters"), // Ensures the description is a string and has at least 3 characters.
  stock: z.coerce.number(), // Coerces the input value into a number for the stock field.
  images: z.array(z.string()).min(1, "Product must have at least one image"), // Ensures the product has an array of image strings with at least one image.
  isFeatured: z.boolean(), // Ensures the isFeatured field is a boolean value.
  banner: z.string().nullable(), // Allows the banner field to either be a string or null.
  price: currency // Validates the price using the `currency` schema defined earlier.
});

/*
  Defines a Zod schema for updating a product.
  - This schema extends `insertProductSchema`, meaning it inherits all the validation rules from it.
  - Additionally, it adds an `id` field, which is required for identifying the product being updated.
*/
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, "Id is required") // // Validates that the id is a string with at least 1 character. If the `id` is missing or empty, an error message "Id is required" will be displayed.
});

// Defines the schema for user sign-in form validation.
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address").min(3, "Email must be at least 3 characters"), // Ensures the email is a valid email address and has at least 3 characters.
  password: z.string().min(3, "Password must be at least 3 characters") // Ensures the password is a string and has at least 3 characters.
});

// Schema for signing up a user
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"), // Validates that the name field is a string with a minimum length of 3 characters.
    email: z.string().min(3, "Email must be at least 3 characters"), // Validates that the email field is a string with a minimum length of 3 characters.
    password: z.string().min(3, "Password must be at least 3 characters"), // Validates that the password field is a string with a minimum length of 3 characters.
    confirmPassword: z.string().min(3, "Confirm password must be at least 3 characters") // Validates that the confirmPassword field is a string with a minimum length of 3 characters.
  })
  // Refines the schema with a custom validation function.
  .refine(
    data => data.password === data.confirmPassword, // Custom validation function that checks if password and confirmPassword fields match.
    {
      message: "Passwords don't match", // Error message if the custom validation fails.
      path: ["confirmPassword"] // Specifies the path where the error should be added, indicating the confirmPassword field.
    }
  );

// Cart Schemas //

// Defines the schema for a single cart item
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"), // Validates that productId is a non-empty string.
  name: z.string().min(1, "Name is required"), // Validates that name is a non-empty string.
  slug: z.string().min(1, "Slug is required"), // Validates that slug is a non-empty string.
  qty: z.number().int().nonnegative("Quantity must be a positive number"), // Validates that qty is a non-negative integer.
  image: z.string().min(1, "Image is required"), // Validates that image is a non-empty string.
  price: currency // Validates the price is using the 'currency' format.
});

// Defines the schema for inserting a cart
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema), // Validates that items is an array of cart items following cartItemSchema.
  itemsPrice: currency, // Validates that itemsPrice follows the currency format.
  totalPrice: currency, // Validates that totalPrice follows the currency format.
  shippingPrice: currency, // Validates that shippingPrice follows the currency format.
  taxPrice: currency, // Validates that taxPrice follows the currency format.
  sessionCartId: z.string().min(1, "Session cart id is required"), // Validates that sessionCartId is a non-empty string.
  userId: z.string().optional().nullable() // Validates that userId is an optional or nullable string.
});

// Defines the schema for validating a shipping address.
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"), // Validates that `fullName` is a string with a minimum length of 3 characters.
  streetAddress: z.string().min(3, "Address must be at least 3 characters"), // Validates that `streetAddress` is a string with a minimum length of 3 characters.
  city: z.string().min(3, "city must be at least 3 characters"), // Validates that `city` is a string with a minimum length of 3 characters.
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"), // Validates that `postalCode` is a string with a minimum length of 3 characters.
  country: z.string().min(3, "Country must be at least 3 characters"), // Validates that `country` is a string with a minimum length of 3 characters.
  lat: z.number().optional(), // Validates that `lat` is an optional number representing latitude.
  lng: z.number().optional() // Validates that `lng` is an optional number representing longitude.
});

// Defines the schema for payment
export const paymentMethodSchema = z
  .object({
    // Defines the 'type' property as a string with a minimum length of 1 character and a custom error message.
    type: z.string().min(1, "Payment method is required")
  })
  // Refines the schema to include additional custom validation.
  .refine(data => PAYMENT_METHODS.includes(data.type), {
    path: ["type"], // Specifies the path to the 'type' property for validation error messages.
    message: "Invalid payment method" // Provides a custom error message for invalid payment methods.
  });

// Insert Order Schema
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"), // Defines the 'userId' field as a non-empty string with a custom error message if it's empty.
  itemsPrice: currency, // Defines the 'itemsPrice' field and uses a predefined schema for currency validation.
  shippingPrice: currency, // Defines the 'shippingPrice' field and uses a predefined schema for currency validation.
  taxPrice: currency, // Defines the 'taxPrice' field and uses a predefined schema for currency validation.
  totalPrice: currency, // Defines the 'totalPrice' field and uses a predefined schema for currency validation.

  // Defines the 'paymentMethod' field as a string.
  // The refine method adds custom validation to ensure the value is included in the PAYMENT_METHODS array.
  // If the value is not valid, a custom error message "Invalid payment method" is returned.
  paymentMethod: z.string().refine(data => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method"
  }),
  shippingAddress: shippingAddressSchema // Defines the 'shippingAddress' field and uses a predefined schema for address validation.
});

// Insert Order Item Schema
export const insertOrderItemSchema = z.object({
  productId: z.string(), // Defines the 'productId' field as a string.
  slug: z.string(), // Defines the 'slug' field as a string.
  image: z.string(), // Defines the 'image' field as a string.
  name: z.string(), // Defines the 'name' field as a string.
  price: currency, // Defines the 'price' field and uses a predefined schema for currency validation.
  qty: z.number() // Defines the 'qty' field as a number.
});

// Defines paypal payment result
export const paymentResultSchema = z.object({
  id: z.string(), // Defines the 'id' field as a string.
  status: z.string(), // Defines the 'status' field as a string.
  email_address: z.string(), // Defines the 'email_address' field as a string.
  pricePaid: z.string() // Defines the 'pricePaid' field as a string.
});

// Defines a schema for updating a user's profile
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(3, "Email must be at least 3 characters")
});

/*
  Updating a user.

  This schema extends the `updateProfileSchema` and adds additional validation 
  for user properties such as `id`, `name`, and `role`.

  Fields:
  - `id`: Required string with a minimum length of 1 (ensures an ID is provided).
  - `name`: Required string with a minimum length of 3 characters.
  - `role`: Required string with a minimum length of 1 (ensures a role is provided).
*/
export const updateUserSchema = updateProfileSchema.extend({
  /*
    Validates the `id` field.
    - Must be a string.
    - Must have at least 1 character.
    - Displays an error message "Id is required" if the field is empty.
  */
  id: z.string().min(1, "Id is required"),

  /*
    Validates the `name` field.
    - Must be a string.
    - Must have at least 3 characters.
    - Displays an error message "Name must be at least 3 characters" if validation fails.
  */
  name: z.string().min(3, "Name must be at least 3 characters"),

  /*
    Validates the `role` field.
    - Must be a string.
    - Must have at least 1 character.
    - Displays an error message "Role is required" if the field is empty.
  */
  role: z.string().min(1, "Role is required")
});

// Insert Review Schema
export const insertReviewSchema = z.object({
  title: z
    .string() // Ensures the "title" field is a string.
    .min(3, "Title must be at least 3 characters"), // Requires at least 3 characters; otherwise, an error message is returned.

  description: z
    .string() // Ensures the "description" field is a string.
    .min(3, "Description must be at least 3 characters"), // Requires at least 3 characters; otherwise, an error message is returned.

  productId: z
    .string() // Ensures the "productId" field is a string.
    .min(1, "Product is required"), // Requires at least 1 character to ensure it's not empty; otherwise, an error message is returned.

  userId: z
    .string() // Ensures the "userId" field is a string.
    .min(1, "User is required"), // Requires at least 1 character to ensure it's not empty; otherwise, an error message is returned.

  rating: z.coerce // Uses `coerce` to automatically convert input values (e.g., from strings) to numbers if possible.
    .number() // Ensures the "rating" field is a number.
    .int() // Ensures the rating is an integer (no decimals allowed).
    .min(1, "Rating must be at least 1") // Requires the rating to be at least 1; otherwise, an error message is returned.
    .max(5, "Rating must be at most 5") // Requires the rating to be at most 5; otherwise, an error message is returned.
});
