/**
 * This block of code defines a client-side component for a user sign-up form using React and Next.js.
 * - Uses custom UI components for input fields and buttons.
 * - Integrates form validation and state management.
 * - Provides feedback to the user during the sign-up process and handles redirection to sign-in.
 * - Handles callback URLs for post-sign-up redirection.
 */

"use client"; // Declares that this code is intended to run on the client side (browser).

import { Button } from "@/components/ui/button"; // Imports a custom Button component from the specified path.
import { Input } from "@/components/ui/input"; // Imports a custom Input component from the specified path.
import { Label } from "@/components/ui/label"; // Imports a custom Label component from the specified path.
import { signUpDefaultValues } from "@/lib/constants"; // Imports default values for the sign-up form fields.
import Link from "next/link"; // Imports the Link component from Next.js for client-side navigation.
import { useSearchParams } from "next/navigation"; // Imports the useSearchParams hook from Next.js for managing URL search parameters.
import { useActionState } from "react"; // Imports the useActionState hook from React for managing state.
import { useFormStatus } from "react-dom"; // Imports the useFormStatus hook from React DOM for form status management.
import { signUp } from "@/lib/actions/user.actions"; // Imports the signUp function for handling user sign-up actions.

const SignUpForm = () => {
  // Defines a state for managing the form data and action status.
  const [data, action] = useActionState(signUp, {
    message: "",
    success: false
  });

  const searchParams = useSearchParams(); // Retrieves the current search parameters from the URL.
  const callbackUrl = searchParams.get("callbackUrl") || "/"; // Retrieves the callback URL parameter or defaults to the root URL.

  const SignUpButton = () => {
    const { pending } = useFormStatus(); // Retrieves the pending status of the form submission.
    return (
      <Button disabled={pending} className="w-full" variant="default">
        {/* Displays "Submitting..." when the form submission is pending, otherwise displays "Sign Up". */}
        {pending ? "Submitting..." : "Sign Up"}
      </Button>
    );
  };

  return (
    <form action={action}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" defaultValue={signUpDefaultValues.name} autoComplete="name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="text" defaultValue={signUpDefaultValues.email} autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" required type="password" defaultValue={signUpDefaultValues.password} autoComplete="current-password" />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" required type="password" defaultValue={signUpDefaultValues.confirmPassword} autoComplete="current-password" />
        </div>
        <div>
          <SignUpButton />
        </div>

        {/* Displays an error message if sign-up fails. */}
        {!data.success && <div className="text-center text-destructive">{data.message}</div>}

        <div className="text-sm text-center text-muted-foreground">
          Already have an account? {/* Provides a link to the sign-in page with the callback URL. */}
          <Link target="_self" className="link" href={`/sign-in?callbackUrl=${callbackUrl}`}>
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};

export default SignUpForm; // Exports the SignUpForm component as the default export.
