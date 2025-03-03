/**
 * This component, ShippingAddressForm, handles the display and submission of a form for entering a shipping address.
 * It validates user input using Zod schemas, and updates the user's address in the database upon form submission.
 * The component also provides feedback to the user through toast notifications.
 */

"use client"; // Indicates that this code is intended to run on the client side.

import { SubmitHandler, useForm } from "react-hook-form"; // Imports necessary functions from react-hook-form for form handling.
import { ShippingAddress } from "@/types"; // Imports the ShippingAddress type.
import { useRouter } from "next/navigation"; // Imports the useRouter hook for navigation.
import { z } from "zod"; // Imports Zod for schema validation.
import { zodResolver } from "@hookform/resolvers/zod"; // Imports the Zod resolver for react-hook-form.
import { shippingAddressSchema } from "@/lib/validator"; // Imports the shipping address validation schema.
import { ControllerRenderProps } from "react-hook-form"; // Imports the ControllerRenderProps type for form control.
import { shippingAddressDefaultValues } from "@/lib/constants"; // Imports default values for the shipping address form.
import { useTransition } from "react"; // Imports the useTransition hook from React for managing state transitions.
import { updateUserAddress } from "@/lib/actions/user.actions"; // Imports the updateUserAddress function to update the user's address.
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Imports form components.
import { Input } from "@/components/ui/input"; // Imports the Input component.
import { Button } from "@/components/ui/button"; // Imports the Button component.
import { ArrowRight, Loader } from "lucide-react"; // Imports icons from lucide-react.
import { toast } from "sonner"; // Imports the toast function from Sonner for displaying notifications.
import CheckoutSteps from "@/components/shared/checkout-steps"; // Imports the CheckoutSteps component for displaying the checkout progress.

// The ShippingAddressForm component accepts an address prop of type ShippingAddress or null.
// The { address }: { address: ShippingAddress | null } syntax is a TypeScript feature for destructuring props and specifying their types.
const ShippingAddressForm = ({ address }: { address: ShippingAddress | null }) => {
  const router = useRouter(); // Initializes the router for navigation.
  const [isPending, startTransition] = useTransition(); // Manages the transition state.

  // Initializes the form with the Zod resolver and default values.
  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema), // Uses the Zod resolver for validation.
    defaultValues: address || shippingAddressDefaultValues // Sets default values for the form fields.
  });

  // Handles form submission. Defines the form submission handler, specifying the expected form values type using SubmitHandler from react-hook-form and inferring the type from the shippingAddressSchema zod schema.
  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async values => {
    // Starts the transition state and updates the user's address.
    startTransition(async () => {
      const res = await updateUserAddress(values); // Calls the updateUserAddress function with form values.

      // Displays an error toast if the address update fails.
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      router.push("/payment-method"); // Navigates to the payment method page upon successful address update.
    });
  };

  return (
    <>
      <CheckoutSteps current={1} /> {/* Displays the checkout steps with the current step highlighted. */}
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Shipping Address</h1>
        <p className="text-sm text-muted-foreground">Please enter the address that you want to ship to</p>
        {/* Renders the form using the react-hook-form library. */}
        <Form {...form}>
          <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control} // Passes the form control to the FormField component.
                name="fullName"
                // Renders the form field for the full name.
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, "fullName"> }) => (
                  <FormItem className="w-full">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      {/* Renders the input field for the full name. */}
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    {/* Displays the form message for validation errors. */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control} // Passes the form control to the FormField component.
                name="streetAddress"
                // Renders the form field for the street address.
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, "streetAddress"> }) => (
                  <FormItem className="w-full">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      {/* Renders the input field for the street address. */}
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    {/* Displays the form message for validation errors. */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control} // Passes the form control to the FormField component.
                name="city"
                // Renders the form field for the city.
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, "city"> }) => (
                  <FormItem className="w-full">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      {/* Renders the input field for the city. */}
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    {/* Displays the form message for validation errors. */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} // Passes the form control to the FormField component.
                name="country"
                // Renders the form field for the country.
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, "country"> }) => (
                  <FormItem className="w-full">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      {/* Renders the input field for the country. */}
                      <Input placeholder="Enter country" {...field} />
                    </FormControl>
                    {/* Displays the form message for validation errors. */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} // Passes the form control to the FormField component.
                name="postalCode"
                // Renders the form field for the postal code.
                render={({ field }: { field: ControllerRenderProps<z.infer<typeof shippingAddressSchema>, "postalCode"> }) => (
                  <FormItem className="w-full">
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      {/* Renders the input field for the postal code. */}
                      <Input placeholder="Enter postal code" {...field} />
                    </FormControl>
                    {/* Displays the form message for validation errors. */}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {/* Displays a loading spinner or an arrow icon based on the transition state. */}
                {isPending ? <Loader className="animate-spin w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ShippingAddressForm;
