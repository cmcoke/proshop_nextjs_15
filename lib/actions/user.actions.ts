/**
 * This block of code handles user authentication using custom server-side functions.
 * - The `signInWithCredentials` function validates user input, attempts to sign in with credentials, and handles errors gracefully.
 * - The `signOutUser` function logs the user out by calling the `signOut` function.
 * - These functions integrate with Next.js and NextAuth.js for secure and robust authentication.
 */

"use server"; // Specifies that the code is designed to run on the server side.

import { isRedirectError } from "next/dist/client/components/redirect-error"; // Imports a helper function to handle redirect-related errors.
import { signIn, signOut } from "@/auth"; // Imports `signIn` and `signOut` functions for managing user authentication.
import { signInFormSchema } from "../validator"; // Imports the schema for validating user sign-in form data using Zod.

// Handles user sign-in with email and password credentials.
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
  try {
    // Validates and parses the form data (email and password) using the `signInFormSchema`.
    const user = signInFormSchema.parse({
      email: formData.get("email"), // Retrieves the "email" field from the form data.
      password: formData.get("password") // Retrieves the "password" field from the form data.
    });

    // Attempts to sign in the user with their credentials.
    await signIn("credentials", user);

    // Returns a success response if the sign-in process is successful.
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    // Checks if the error is a redirect error (e.g., triggered by a navigation issue) and rethrows it.
    if (isRedirectError(error)) {
      throw error;
    }

    // Returns a failure response with an error message for invalid credentials.
    return { success: false, message: "Invalid email or password" };
  }
}

// Handles user sign-out.
export async function signOutUser() {
  // Calls the `signOut` function to log the user out.
  await signOut();
}
