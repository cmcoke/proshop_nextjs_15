/**
 * ----------------------------------------------------------------------------
 * Summary:
 * This file configures authentication and authorization using NextAuth.js.
 *
 * - Defines the NextAuth configuration object (`authConfig`) including providers
 *   and custom callback logic.
 * - Implements route protection through the `authorized` callback, ensuring
 *   specific paths can only be accessed by authenticated users.
 * - Ensures every user (authenticated or not) has a "sessionCartId" cookie
 *   by generating one if it doesn't exist.
 * - Creates and exports NextAuth helpers (`auth`, `handlers`, `signIn`, `signOut`)
 *   which are used by Next.js middleware and server routes.
 *
 * In summary, this file handles user authentication, route access control,
 * session cart ID maintenance, and exposes the required NextAuth utilities
 * for the rest of the application.
 * ----------------------------------------------------------------------------
 */

// Imports the NextAuth function and the NextAuthConfig type for type checking.
import NextAuth, { type NextAuthConfig } from "next-auth";

// Imports NextResponse, which enables generating custom responses inside middleware.
import { NextResponse } from "next/server";

/**
 * Defines the authentication configuration for NextAuth.js.
 * This configuration is later passed into NextAuth() below.
 */
export const authConfig: NextAuthConfig = {
  // Array of authentication providers. Currently empty but required by the type.
  providers: [],

  callbacks: {
    /**
     * The `authorized` callback runs for every request handled by NextAuth middleware.
     * It determines whether the user is allowed to access a given route.
     */
    authorized({ request, auth }) {
      // A list of paths (expressed as regex patterns) that require authentication.
      const protectedPaths = [/\/shipping-address/, /\/payment-method/, /\/place-order/, /\/profile/, /\/user\/(.*)/, /\/order\/(.*)/, /\/admin/];

      // Extracts the pathname (e.g., "/profile", "/order/123") from the request URL.
      const { pathname } = request.nextUrl;

      // Checks if the user is NOT authenticated AND is visiting a protected route. If true, return false → blocks access.
      if (!auth && protectedPaths.some(p => p.test(pathname))) {
        return false;
      }

      // Checks if the request does NOT contain a "sessionCartId" cookie.
      if (!request.cookies.get("sessionCartId")) {
        // Generates a brand-new unique ID for the user's cart session.
        const sessionCartId = crypto.randomUUID();

        // Creates a new response and forwards along the original request headers.
        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers)
          }
        });

        // Saves the new sessionCartId cookie to the response.
        response.cookies.set("sessionCartId", sessionCartId);

        // Returns the response that includes the newly set cookie.
        return response;
      }

      // If the user is authorized, OR already has a sessionCartId cookie, allow the request to proceed normally.
      return true;
    }
  }
};

// Initializes NextAuth with the configuration above.
// Extracts helper functions for use across the application.
// - `auth` → Used in middleware to run authentication logic.
// - `handlers` → API route handlers for NextAuth endpoints.
// - `signIn` & `signOut` → Server actions for controlling user sessions.
export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
