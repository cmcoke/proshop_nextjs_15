/**
 * This block of code defines a Next.js page for user sign-up.
 * - It imports necessary components and libraries.
 * - Checks if a user session exists and redirects to the callback URL or home page if logged in.
 * - Renders a sign-up form using custom UI components, including a logo, form fields, and links to sign in.
 */

import { Metadata } from "next"; // Imports the Metadata type from Next.js for page metadata.
import Image from "next/image"; // Imports the Image component from Next.js for optimized image rendering.
import Link from "next/link"; // Imports the Link component from Next.js for client-side navigation.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Imports custom Card components for UI structure.
import { APP_NAME } from "@/lib/constants"; // Imports a constant for the application name.
import { auth } from "@/auth"; // Imports the auth function for managing user authentication.
import { redirect } from "next/navigation"; // Imports the redirect function from Next.js for handling redirects.
import SignUpForm from "./signup-form"; // Imports the SignUpForm component for the sign-up form.

export const metadata: Metadata = {
  title: "Sign Up" // Sets the page title to "Sign Up" in the metadata.
};

// Defines the props for the SignUp function, including a promise for searchParams containing the callbackUrl.
const SignUp = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const searchParams = await props.searchParams; // Waits for the searchParams promise to resolve.

  const { callbackUrl } = searchParams; // Extracts the callbackUrl from the search parameters.

  const session = await auth(); // Checks if a user session exists using the auth function.

  if (session) {
    return redirect(callbackUrl || "/"); // Redirects to the callback URL or home page if a user session is found.
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-4">
          <Link href="/" className="flex-center">
            <Image priority={true} src="/images/logo.svg" width={100} height={100} alt={`${APP_NAME} logo`} />
          </Link>
          <CardTitle className="text-center">Create Account</CardTitle>
          <CardDescription className="text-center">Enter your information below to create your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp; // Exports the SignUp component as the default export.
