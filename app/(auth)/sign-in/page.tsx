/**
 * This block of code defines a Next.js page for user sign-in.
 * - It imports necessary components and libraries.
 * - Checks if a user session exists and redirects to the home page if logged in.
 * - Renders a sign-in form using custom UI components, including a logo, form fields, and links to sign up.
 * - Handles callback URLs for post-sign-in redirection.
 */

import { Metadata } from "next"; // Imports the Metadata type from Next.js for page metadata.
import Image from "next/image"; // Imports the Image component from Next.js for optimized image rendering.
import Link from "next/link"; // Imports the Link component from Next.js for client-side navigation.
import { redirect } from "next/navigation"; // Imports the redirect function from Next.js for handling redirects.

import { auth } from "@/auth"; // Imports the auth function for managing user authentication.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Imports custom Card components for UI structure.
import { APP_NAME } from "@/lib/constants"; // Imports a constant for the application name.
import CredentialsSignInForm from "./credentials-signin-form"; // Imports the CredentialsSignInForm component for the sign-in form.

export const metadata: Metadata = {
  title: "Sign In" // Sets the page title to "Sign In" in the metadata.
};

// Defines the props for the SignIn function, including a promise for searchParams containing the callbackUrl.
const SignIn = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const { callbackUrl } = await props.searchParams; // Retrieves the callbackUrl from the search parameters.

  // Checks if a user session exists using the auth function.
  const session = await auth();

  // Redirects to the callback URL or home page if a user session is found.
  if (session) {
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image priority={true} src="/images/logo.svg" width={100} height={100} alt={`${APP_NAME} logo`} />
          </Link>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Select a method to sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
