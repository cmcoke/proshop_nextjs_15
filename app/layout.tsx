/**
 * This component defines the root layout of the Next.js application.
 * It sets up global metadata, imports global styles, configures font, and wraps the application with a ThemeProvider.
 * */

import type { Metadata } from "next"; // Imports the Metadata type from Next.js for defining page metadata.
import { Inter } from "next/font/google";
import "@/assets/styles/globals.css";
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants";
import { ThemeProvider } from "next-themes"; // Imports the ThemeProvider for managing themes.

const inter = Inter({ subsets: ["latin"] });

// Defines the metadata for the application.
export const metadata: Metadata = {
  // Sets the title template and default title.
  title: {
    template: `%s | ${APP_NAME}`, // Template for dynamic page titles (e.g., "Page Title | App Name").
    default: APP_NAME // Default title if no specific title is provided.
  },
  description: APP_DESCRIPTION, // Sets the application description.
  metadataBase: new URL(SERVER_URL) // Sets the base URL for metadata (used for absolute URLs).
};

// Defines the RootLayout component, which wraps all pages.
export default function RootLayout({
  children // Accepts children components (pages) as props.
}: Readonly<{
  children: React.ReactNode; // Defines the type of children as React nodes.
}>) {
  return (
    // Defines the root HTML element with language set to English and disables hydration warnings.
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class" // Sets the attribute to use for theme switching (class).
          defaultTheme="light" // Sets the default theme to light.
          enableSystem // Enables system theme detection.
          disableTransitionOnChange // Disables theme transition animations.
        >
          {/* Renders the children components (pages) wrapped by the ThemeProvider. */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
