/**
 *
 *
 */

"use server"; // Specifies that the code is designed to run on the server side.

import { isRedirectError } from "next/dist/client/components/redirect-error"; // Imports a helper function to handle redirect-related errors.
import { auth, signIn, signOut } from "@/auth"; // Imports `signIn` and `signOut` functions for managing user authentication.
import { shippingAddressSchema, signInFormSchema, signUpFormSchema, paymentMethodSchema } from "../validator"; // Imports various schemas for validation from the validator file.
import { hashSync } from "bcrypt-ts-edge"; // Imports the hashSync function from bcrypt-ts-edge for password hashing.
import { prisma } from "@/db/prisma"; // Imports the Prisma client for interacting with the database.
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { z } from "zod"; // Imports Zod for schema validation.
import { getMyCart } from "./cart.actions";

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
  // get current users cart and delete it so it does not persist to next user
  const currentCart = await getMyCart();

  if (currentCart?.id) {
    await prisma.cart.delete({ where: { id: currentCart.id } });
  } else {
    console.warn("No cart found for deletion.");
  }

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

// Get user by ID
export async function getUserById(userId: string) {
  // Finds the first user in the database whose `id` matches the given `userId`.
  const user = await prisma.user.findFirst({
    where: { id: userId }
  });

  if (!user) throw new Error("User not found"); // Throws an error if no user is found with the given `userId`.
  return user; // Returns the found user object.
}

// Update user's address
export async function updateUserAddress(data: ShippingAddress) {
  // Start a try block to handle any errors that may occur during the update process.
  try {
    const session = await auth(); // Retrieves the current user session.

    // Finds the current user in the database using the user ID from the session.
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id }
    });

    // Throws an error if no user is found with the given user ID.
    if (!currentUser) throw new Error("User not found");

    // Parses and validates the provided address data using the shippingAddressSchema.
    const address = shippingAddressSchema.parse(data);

    // Updates the user's address in the database with the validated address data.
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address }
    });

    // Returns a success response if the address update is successful.
    return {
      success: true,
      message: "User updated successfully"
    };
  } catch (error) {
    // Returns a failure response with an error message if an error occurs during the update process.
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method.
// The 'data: z.infer<typeof paymentMethodSchema>' refers to the function parameter 'data', which is inferred to have the structure defined by 'paymentMethodSchema' using Zod.
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
  // Start a try block to handle any errors that may occur during the update process.
  try {
    const session = await auth(); // Retrieves the current user session.

    // Finds the current user in the database using the user ID from the session.
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id } // Matches the user ID from the session.
    });

    // Throws an error if no user is found with the given user ID.
    if (!currentUser) throw new Error("User not found");

    // Parses and validates the provided payment method data using the paymentMethodSchema.
    const paymentMethod = paymentMethodSchema.parse(data);

    // Updates the user's payment method in the database with the validated payment method type.
    await prisma.user.update({
      where: { id: currentUser.id }, // Matches the user ID to update the correct user.
      data: { paymentMethod: paymentMethod.type } // Updates the user's payment method with the validated type.
    });

    // Returns a success response if the payment method update is successful.
    return {
      success: true,
      message: "User updated successfully"
    };
  } catch (error) {
    // Returns a failure response with an error message if an error occurs during the update process.
    return { success: false, message: formatError(error) };
  }
}

// Update the user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id
      }
    });

    if (!currentUser) throw new Error("User not found");

    await prisma.user.update({
      where: {
        id: currentUser.id
      },
      data: {
        name: user.name
      }
    });

    return {
      success: true,
      message: "User updated successfully"
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
