/**
 * This code configures authentication and authorization for the application using NextAuth.js.
 * - Defines the authentication configuration with necessary providers and callbacks.
 * - Protects specific paths and ensures users are authenticated before accessing them.
 * - Generates and sets a session cart ID cookie if it doesn't exist.
 *
 *  This setup ensures that users are properly authenticated before accessing sensitive parts of the application and that a session cart ID is present for tracking user sessions.
 */

import type { NextAuthConfig } from "next-auth"; // Imports the NextAuthConfig type from the next-auth package for type safety.
import { NextResponse } from "next/server"; // Imports the NextResponse object from the next/server module to handle server responses.

export const authConfig = {
  providers: [], // Defines the authentication providers. Required by the NextAuthConfig type.

  callbacks: {
    // Defines a callback function to handle authorization logic.
    authorized({ request, auth }: any) {
      // Array of regex patterns for paths that require protection.
      const protectedPaths = [/\/shipping-address/, /\/payment-method/, /\/place-order/, /\/profile/, /\/user\/(.*)/, /\/order\/(.*)/, /\/admin/];

      // Extracts the pathname from the request URL.
      const { pathname } = request.nextUrl;

      // Checks if the user is not authenticated and is trying to access a protected path.
      if (!auth && protectedPaths.some(p => p.test(pathname))) return false;

      // Checks if the session cart ID cookie is not present in the request.
      if (!request.cookies.get("sessionCartId")) {
        // Generates a new session cart ID using a random UUID.
        const sessionCartId = crypto.randomUUID();

        // Creates a new response object and adds the request headers to it.
        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers)
          }
        });

        // Sets the newly generated session cart ID in the response cookies.
        response.cookies.set("sessionCartId", sessionCartId);

        // Returns the response object with the new session cart ID cookie.
        return response;
      }

      // If the user is authenticated or the session cart ID cookie exists, allows the request to proceed.
      return true;
    }
  }
} satisfies NextAuthConfig; // Ensures the configuration satisfies the NextAuthConfig type definition.
