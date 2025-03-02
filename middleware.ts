/**
 * This code sets up the authentication middleware for the application using NextAuth.js.
 * - Imports the necessary modules for NextAuth.js.
 * - Configures NextAuth.js with the specified authentication configuration.
 * - Exports the configured authentication middleware.
 *
 *  This setup ensures that the authentication middleware is properly configured and ready to handle authentication processes within the Next.jsapplication.
 */

import NextAuth from "next-auth"; // Imports the NextAuth.js module to handle authentication.
import { authConfig } from "./auth.config"; // Imports the authentication configuration from the auth.config file.

export const { auth: middleware } = NextAuth(authConfig); // Configures NextAuth.js with the specified authentication configuration and exports the authentication middleware.
