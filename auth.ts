/**
 *
 *
 */

import { compareSync } from "bcrypt-ts-edge"; // Imports the compareSync function from bcrypt-ts-edge for password comparison.
import type { NextAuthConfig } from "next-auth"; // Imports the type definition for NextAuth configuration.
import NextAuth from "next-auth"; // Imports the NextAuth function for authentication setup.
import CredentialsProvider from "next-auth/providers/credentials"; // Imports the credentials provider for custom email/password authentication.

import { prisma } from "@/db/prisma"; // Imports the Prisma client for interacting with the database.
import { PrismaAdapter } from "@auth/prisma-adapter"; // Imports the Prisma adapter to integrate Prisma with NextAuth.js.

export const config = {
  // Configures the custom pages for NextAuth.js, specifying routes for the sign-in page and error handling.
  pages: {
    signIn: "/sign-in", // Specifies the custom sign-in page route.
    error: "/sign-in" // Specifies the error page route in case of authentication errors.
  },

  // Configures the session management for NextAuth.js, using JSON Web Tokens (JWT) for stateless authentication.
  session: {
    strategy: "jwt", // Sets the session strategy to use JSON Web Tokens (JWT).
    maxAge: 30 * 24 * 60 * 60 // Sets session expiration to 30 days (30 days * 24 hours * 60 minutes * 60 seconds = 2,592,000 seconds, which is equivalent to 30 days.).
  },

  adapter: PrismaAdapter(prisma), // Configures the Prisma adapter to use the Prisma client for managing user data.

  // Defines the authentication providers, in this case, a custom credentials provider for email/password authentication.
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" }, // Defines the email field as a credential for authentication.
        password: { type: "password" } // Defines the password field as a credential for authentication.
      },
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
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role // Includes the user's role for authorization purposes.
            };
          }
        }

        // Return null if the user doesn't exist or the password is incorrect.
        return null;
      }
    })
  ],

  //
  callbacks: {
    //
    async session({ session, user, trigger, token }: any) {
      // Set the user ID on the session object using the token.
      session.user.id = token.sub;
      session.user.name = token.name;
      session.user.role = token.role;

      // console.log(token);

      // Update the session object with the user's name if triggered by an update.
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session; // Return the modified session object.
    },
    //
    async jwt({ token, user, trigger, session }: any) {
      // Assign user fields to token
      if (user) {
        token.role = user.role;

        // If user has no name, use email as their default name Example if email is tom@gmail.com then tom will be used as the name
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          // Update the user in the database with the new name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name }
          });
        }
      }

      // Handle session updates (e.g., name change)
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    }
  }
} satisfies NextAuthConfig; // Ensures the configuration satisfies the NextAuthConfig type definition.

// Exports authentication-related handlers and functions (e.g., signIn and signOut) for use in the application.
export const { handlers, auth, signIn, signOut } = NextAuth(config);
