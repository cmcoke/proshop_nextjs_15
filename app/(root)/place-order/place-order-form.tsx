/**
 * This component, PlaceOrderForm, handles the form submission for placing an order.
 * It calls the createOrder function to create the order and navigates to the appropriate page based on the response.
 * The component provides feedback to the user through a loading spinner and a success icon.
 */

"use client"; // Indicates that this code is intended to run on the client side.

import { Check, Loader } from "lucide-react"; // Imports the Check and Loader icons from lucide-react.
import { useFormStatus } from "react-dom"; // Imports the useFormStatus hook from React.
import { Button } from "@/components/ui/button"; // Imports the Button component from the UI library.
import { createOrder } from "@/lib/actions/order.actions"; // Imports the createOrder function to create a new order.
import { useRouter } from "next/navigation"; // Imports the useRouter hook for navigation.

const PlaceOrderForm = () => {
  const router = useRouter(); // Initializes the router for navigation.

  // Defines the handleSubmit function to handle form submission.
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevents the default form submission behavior.

    const res = await createOrder(); // Calls the createOrder function to create a new order and waits for the response.

    // Checks if the response contains a redirectTo property and navigates to the specified URL if it does.
    if (res.redirectTo) {
      router.push(res.redirectTo); // Navigates to the specified URL.
    }
  };

  // Defines the PlaceOrderButton component to handle the order button state.
  const PlaceOrderButton = () => {
    const { pending } = useFormStatus(); // Retrieves the pending status from the useFormStatus hook.
    return (
      <Button disabled={pending} className="w-full">
        {/* Displays a loading spinner or a success icon based on the pending status. */}
        {pending ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Place Order
      </Button>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <PlaceOrderButton />
    </form>
  );
};

export default PlaceOrderForm;
