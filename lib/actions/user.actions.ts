/**
 *
 *
 */

"use server"; // Specifies that the code is designed to run on the server side.

import { isRedirectError } from "next/dist/client/components/redirect-error"; // Imports a helper function to handle redirect-related errors.
import { signIn, signOut } from "@/auth"; // Imports `signIn` and `signOut` functions for managing user authentication.
import { signInFormSchema, signUpFormSchema } from "../validator"; // Imports validation schemas for sign-in and sign-up forms.
import { hashSync } from "bcrypt-ts-edge"; // Imports the hashSync function from bcrypt-ts-edge for password hashing.
import { prisma } from "@/db/prisma"; // Imports the Prisma client for interacting with the database.
import { formatError } from "../utils";

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

// Register a new user
export async function signUp(prevState: unknown, formData: FormData) {
  try {
    // Parses and validates the form data using the signUpFormSchema.
    const user = signUpFormSchema.parse({
      name: formData.get("name"), // Retrieves the "name" field from the form data.
      email: formData.get("email"), // Retrieves the "email" field from the form data.
      confirmPassword: formData.get("confirmPassword"), // Retrieves the "confirmPassword" field from the form data.
      password: formData.get("password") // Retrieves the "password" field from the form data.
    });

    const plainPassword = user.password; // Stores the plain text password for later use in sign-in.

    user.password = hashSync(user.password, 10); // Hashes the user's password with a salt factor of 10 for secure storage.

    // Creates a new user record in the database with the validated and hashed data.
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password
      }
    });

    // Signs in the user automatically after successful registration.
    await signIn("credentials", {
      email: user.email,
      password: plainPassword
    });

    return { success: true, message: "User registered successfully" }; // Returns a success response with a message.
  } catch (error) {
    // console.log(error.name);
    // console.log(error.code);
    // console.log(error.errors);
    // console.log(error.meta?.target);

    // Checks if the error is a redirect error and rethrows it if so.
    if (isRedirectError(error)) {
      throw error;
    }

    // Returns a failure response with an error message.
    return {
      success: false,
      message: formatError(error)
    };
  }
}
