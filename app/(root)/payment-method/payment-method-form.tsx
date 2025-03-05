/**
 * This component, PaymentMethodForm, handles the display and submission of a form for selecting a payment method.
 * It validates user input using Zod schemas and updates the user's payment method upon form submission.
 * The component provides feedback to the user through toast notifications and manages form state using react-hook-form.
 */

"use client"; // Indicates that this code is intended to run on the client side.

import { Button } from "@/components/ui/button"; // Imports the Button component.
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Imports form components.
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Imports RadioGroup components for radio button input.
import { toast } from "sonner"; // Imports the toast function from Sonner for displaying notifications.
import { updateUserPaymentMethod } from "@/lib/actions/user.actions"; // Imports the updateUserPaymentMethod function to update the user's payment method.
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants"; // Imports the DEFAULT_PAYMENT_METHOD and PAYMENT_METHODS from the constants file.
import { paymentMethodSchema } from "@/lib/validator"; // Imports the payment method validation schema.
import { zodResolver } from "@hookform/resolvers/zod"; // Imports the Zod resolver for react-hook-form.
import { ArrowRight, Loader } from "lucide-react"; // Imports icons from lucide-react.
import { useRouter } from "next/navigation"; // Imports the useRouter hook for navigation.
import { useTransition } from "react"; // Imports the useTransition hook from React for managing state transitions.
import { useForm } from "react-hook-form"; // Imports necessary functions from react-hook-form for form handling.
import { z } from "zod"; // Imports Zod for schema validation.

// The PaymentMethodForm component accepts a preferredPaymentMethod prop of type string or null.
// The { preferredPaymentMethod }: { preferredPaymentMethod: string | null } syntax is a TypeScript feature for destructuring props and specifying their types.
const PaymentMethodForm = ({ preferredPaymentMethod }: { preferredPaymentMethod: string | null }) => {
  const router = useRouter(); // Initializes the router for navigation.

  // Initializes the form with the Zod resolver and default values.
  // useForm<z.infer<typeof paymentMethodSchema>> initializes the form with the inferred type from paymentMethodSchema using Zod, ensuring the form values adhere to the schema.
  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema), // Uses the Zod resolver for validation.
    // Sets default values for the form fields, defaulting to DEFAULT_PAYMENT_METHOD if no preferred payment method is provided.
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD
    }
  });

  const [isPending, startTransition] = useTransition(); // Manages the transition state.

  // Handles form submission.
  async function onSubmit(values: z.infer<typeof paymentMethodSchema>) {
    // Starts the transition state and updates the user's payment method.
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values); // Calls the updateUserPaymentMethod function with form values.

      // Displays an error toast if the payment method update fails.
      if (!res.success) {
        toast.error(res.message);
        return;
      }

      router.push("/place-order"); // Navigates to the place order page upon successful payment method update.
    });
  }

  return (
    <>
      <div className="max-w-md mx-auto">
        {/* Renders the form using the react-hook-form library. */}
        <Form {...form}>
          <form method="post" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <h1 className="h2-bold mt-4">Payment Method</h1>
            <p className="text-sm text-muted-foreground">Please select your preferred payment method</p>
            <div className="flex flex-col gap-5 md:flex-row">
              <FormField
                control={form.control}
                name="type"
                // Renders the form field for the payment method type.
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} className="flex flex-col space-y-2">
                        {/* Maps through the PAYMENT_METHODS array to render radio buttons for each payment method. */}
                        {PAYMENT_METHODS.map(paymentMethod => (
                          <FormItem key={paymentMethod} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              {/* Renders a radio button for each payment method. */}
                              <RadioGroupItem value={paymentMethod} checked={field.value === paymentMethod} />
                            </FormControl>
                            <FormLabel className="font-normal">{paymentMethod}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
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

export default PaymentMethodForm;
