/**
 * This code block sets up the metadata for the Next.js application
 * and defines the RootLayout component that wraps the application
 * with theme support and global styles.
 **/

import type { Metadata } from "next"; // Imports the Metadata type from Next.js for defining page metadata.
import { Inter } from "next/font/google"; // Imports the Inter font from Google Fonts.
import "@/assets/styles/globals.css"; // Imports global CSS styles.
import { APP_NAME, APP_DESCRIPTION, SERVER_URL } from "@/lib/constants"; // Imports constants for app name, description, and server URL.
import { ThemeProvider } from "next-themes"; // Imports the ThemeProvider for managing themes.
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({ subsets: ["latin"] }); // Initializes the Inter font with Latin subset.

/**
 * This object defines the metadata for the application.
 * It includes the title template, default title, description,
 * and the base URL for the metadata.
 **/
export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`, // Sets the template for the title, including the app name.
    default: APP_NAME // Sets the default title to the app name.
  },
  description: APP_DESCRIPTION, // Sets the description of the app.
  metadataBase: new URL(SERVER_URL) // Sets the base URL for the metadata.
};

/**
 * This function `RootLayout` defines the root layout of the application.
 * It wraps the application with HTML and body tags, and includes theme support.
 * @param children - Readonly object that includes the children components to be rendered within the layout.
 **/
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // Sets the language to English and suppresses hydration warnings.
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* Wraps the children components with theme support */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
