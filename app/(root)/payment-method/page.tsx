/**
 * This component, PaymentMethodPage, handles the display of the payment method form.
 * It fetches the authenticated user's information and displays the payment method form with the user's preferred payment method.
 * The component ensures that the user is authenticated and their user ID is available.
 * It then passes the user's preferred payment method to the PaymentMethodForm component for display and editing.
 */

import { Metadata } from "next"; // Imports the Metadata type for defining page metadata.
import { auth } from "@/auth"; // Imports the auth function for authentication.
import { getUserById } from "@/lib/actions/user.actions"; // Imports the getUserById function to fetch the user by ID.
import PaymentMethodForm from "./payment-method-form"; // Imports the PaymentMethodForm component for displaying the payment method form.
import CheckoutSteps from "@/components/shared/checkout-steps"; // Imports the CheckoutSteps component for displaying the checkout progress.

// Defines the metadata for the page.
export const metadata: Metadata = {
  title: "Payment Method" // Sets the title of the page to "Payment Method".
};

// Defines the PaymentMethodPage component as an asynchronous function.
const PaymentMethodPage = async () => {
  const session = await auth(); // Retrieves the current user session.
  const userId = session?.user?.id; // Extracts the user ID from the session.

  // Throws an error if the user ID is not found.
  if (!userId) {
    throw new Error("User ID not found");
  }

  // Fetches the user information by user ID.
  const user = await getUserById(userId);

  return (
    <>
      {/* Displays the checkout steps with the current step highlighted. */}
      <CheckoutSteps current={2} />
      {/* Renders the PaymentMethodForm component, passing the user's preferred payment method as a prop. */}
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />
    </>
  );
};

export default PaymentMethodPage;
