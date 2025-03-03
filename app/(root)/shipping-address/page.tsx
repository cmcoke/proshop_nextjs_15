/**
 * This component, ShippingAddressPage, handles the display of the shipping address form.
 * It fetches the user's cart and user information, and redirects the user to the cart page if the cart is empty.
 * The component ensures that the user is authenticated and their user ID is available.
 * It then passes the user's address to the ShippingAddressForm component for display and editing.
 */

import { auth } from "@/auth"; // Imports the auth function for authentication.
import { getMyCart } from "@/lib/actions/cart.actions"; // Imports the getMyCart function to fetch the user's cart.
import { getUserById } from "@/lib/actions/user.actions"; // Imports the getUserById function to fetch the user by ID.
import { Metadata } from "next"; // Imports the Metadata type for defining page metadata.
import { redirect } from "next/navigation"; // Imports the redirect function for navigation.
import { ShippingAddress } from "@/types"; // Imports the ShippingAddress type.
import ShippingAddressForm from "./shipping-address-form"; // Imports the ShippingAddressForm component.

// Defines the metadata for the page.
export const metadata: Metadata = {
  title: "Shipping Address" // Sets the title of the page to "Shipping Address".
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart(); // Fetches the user's cart.

  // Redirects to the cart page if the cart is empty or not found.
  if (!cart || cart.items.length === 0) redirect("/cart");

  const session = await auth(); // Retrieves the current user session.

  const userId = session?.user?.id; // Extracts the user ID from the session.

  // Throws an error if the user ID is not found.
  if (!userId) {
    throw new Error("User ID not found");
  }

  const user = await getUserById(userId); // Fetches the user information by user ID.

  return (
    <>
      {/* Renders the ShippingAddressForm component, passing the user's address as a prop. */}
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
