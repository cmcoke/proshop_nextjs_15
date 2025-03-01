/**
 *
 *
 */

import { z } from "zod"; // Imports the Zod library for creating schemas and validating data structures.
import { formatNumberWithDecimal } from "./utils"; // Imports a utility function to format numbers with two decimal places.

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
