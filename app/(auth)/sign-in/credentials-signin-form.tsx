/**
 * This block of code defines a client-side component for a credentials-based sign-in form using NextAuth.js.
 * - Uses custom UI components for input fields and buttons.
 * - Integrates form validation and state management.
 * - Provides feedback to the user during the sign-in process and handles redirection to sign-up.
 * - Handles callback URLs for post-sign-in redirection.
 */

"use client"; // Declares that this code is intended to run on the client side (browser).

import { Button } from "@/components/ui/button"; // Imports a custom Button component from the specified path.
import { Input } from "@/components/ui/input"; // Imports a custom Input component from the specified path.
import { Label } from "@/components/ui/label"; // Imports a custom Label component from the specified path.
import { signInDefaultValues } from "@/lib/constants"; // Imports default values for the sign-in form fields.
import Link from "next/link"; // Imports the Link component from Next.js for client-side navigation.
import { useActionState } from "react"; // Imports useActionState hook from React for managing state.
import { useFormStatus } from "react-dom"; // Imports useFormStatus hook from React DOM for form status management.
import { signInWithCredentials } from "@/lib/actions/user.actions"; // Imports the signInWithCredentials function for handling sign-in actions.
import { useSearchParams } from "next/navigation"; // Imports the useSearchParams hook from Next.js for managing URL search parameters.

const CredentialsSignInForm = () => {
  const searchParams = useSearchParams(); // Retrieves the current search parameters from the URL.
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // Retrieves the callback URL parameter or defaults to the root URL.

  // Defines a state for managing the form data and action status.
  const [data, action] = useActionState(signInWithCredentials, {
    message: "",
    success: false
  });

  const SignInButton = () => {
    const { pending } = useFormStatus(); // Retrieves the pending status of the form submission.
    return (
      <Button disabled={pending} className="w-full" variant="default">
        {/* Displays "Signing In..." when the form submission is pending, otherwise displays "Sign In with credentials". */}
        {pending ? "Signing In..." : "Sign In with credentials"}
      </Button>
    );
  };

  return (
    <form action={action}>
      {/* Stores the callback URL as a hidden input field to be used during sign-in */}
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" required type="email" defaultValue={signInDefaultValues.email} autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" required type="password" defaultValue={signInDefaultValues.password} autoComplete="current-password" />
        </div>
        <div>
          <SignInButton />
        </div>

        {/* Displays an error message if sign-in fails. */}
        {data && !data.success && <div className="text-center text-destructive">{data.message}</div>}

        <div className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link target="_self" className="link" href="/sign-up">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignInForm;
