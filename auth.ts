/**
 * This code sets up authentication and session management for the application using NextAuth.js.
 * It configures custom sign-in and error pages, session management using JWT, and integrates Prisma for database interactions.
 * It also defines custom authentication logic using email and password credentials.
 */

import { compareSync } from "bcrypt-ts-edge"; // Imports the compareSync function from bcrypt-ts-edge for password comparison.
import NextAuth from "next-auth"; // Imports the NextAuth function for authentication setup.
import CredentialsProvider from "next-auth/providers/credentials"; // Imports the credentials provider for custom email/password authentication.
import { cookies } from "next/headers"; // Imports the cookies function from next/headers to access cookies.
import { prisma } from "@/db/prisma"; // Imports the Prisma client for interacting with the database.
import { PrismaAdapter } from "@auth/prisma-adapter"; // Imports the Prisma adapter to integrate Prisma with NextAuth.js.
import { authConfig } from "./auth.config"; // Imports additional authentication configuration.

export const config = {
  // Configures the custom pages for NextAuth.js, specifying routes for the sign-in page and error handling.
  pages: {
    signIn: "/sign-in", // Specifies the custom sign-in page route.
    error: "/sign-in" // Specifies the error page route in case of authentication errors.
  },

  // Configures the session management for NextAuth.js, using JSON Web Tokens (JWT) for stateless authentication.
  session: {
    strategy: "jwt" as const, // Sets the session strategy to use JSON Web Tokens (JWT).
    maxAge: 30 * 24 * 60 * 60 // Sets session expiration to 30 days (30 days * 24 hours * 60 minutes * 60 seconds = 2,592,000 seconds, which is equivalent to 30 days).
  },

  adapter: PrismaAdapter(prisma), // Configures the Prisma adapter to use the Prisma client for managing user data.

  // Defines the authentication providers, in this case, a custom credentials provider for email/password authentication.
  providers: [
    // Sets up a custom credentials provider for email and password authentication.
    CredentialsProvider({
      credentials: {
        email: { type: "email" }, // Defines the email field as a credential for authentication.
        password: { type: "password" } // Defines the password field as a credential for authentication.
      },
      // Defines the authorization logic for the credentials provider.
      async authorize(credentials) {
        if (credentials == null) return null; // Returns null if no credentials are provided.

        // Find user in the database by email.
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string // Matches the email with the credentials provided.
          }
        });

        // Check if user exists and if the password is correct.
        if (user && user.password) {
          const isMatch = compareSync(credentials.password as string, user.password); // Compares the input password with the stored hashed password.
          // If the password matches, return a simplified user object.
          if (isMatch) {
            return {
              id: user.id, // Returns the user's ID.
              name: user.name, // Returns the user's name.
              email: user.email, // Returns the user's email.
              role: user.role // Includes the user's role for authorization purposes.
            };
          }
        }

        // Return null if the user doesn't exist or the password is incorrect.
        return null;
      }
    })
  ],

  // Defines custom callback functions for handling session and JWT logic.
  callbacks: {
    // Custom session callback to modify the session object.
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub; // Adds the user ID to the session object.
      session.user.name = token.name; // Adds the user name to the session object.
      session.user.role = token.role; // Adds the user role to the session object.

      // Update the session object with the user's name if triggered by an update.
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session; // Return the modified session object.
    },
    // Custom JWT callback to modify the token object.
    async jwt({ token, user, trigger, session }: any) {
      // If a user is provided, add their ID, role, and name to the token.
      if (user) {
        token.id = user.id; // Adds the user ID to the token.
        token.role = user.role; // Adds the user role to the token.

        // If user has no name, use email as their default name.
        // Example: if email is tom@gmail.com, then "tom" will be used as the name.
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          // Updates the user's name in the database to the default name.
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name }
          });
        }

        // Handle actions on sign-in or sign-up.
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies(); // Retrieves the cookies.
          const sessionCartId = cookiesObject.get("sessionCartId")?.value; // Gets the value of the sessionCartId cookie.

          // If a session cart ID is found, associate the cart with the logged-in user.
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId }
            });

            // If a session cart is found, overwrite any existing user cart.
            if (sessionCart) {
              await prisma.cart.deleteMany({
                where: { userId: user.id }
              });

              // Assign the guest cart to the logged-in user.
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id }
              });
            }
          }
        }
      }

      // Handle session updates (e.g., name change).
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token; // Return the modified token.
    },
    ...authConfig.callbacks // Spread additional callback configurations from authConfig.
  }
};

// Exports authentication handlers, auth, signIn, and signOut functions from NextAuth configured with the defined config.
export const { handlers, auth, signIn, signOut } = NextAuth(config);
