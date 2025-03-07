/**
 * This component fetches and displays the details of a specific order.
 * It retrieves the order ID from the URL parameters, fetches the order details,
 * and renders them using the `OrderDetailsTable` component.
 * If the order is not found, it redirects the user to a "not found" page.
 */

import { getOrderById } from "@/lib/actions/order.actions";
import { notFound, redirect } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
// import { auth } from "@/auth";

// Defines the metadata for this page, including the title.
export const metadata = {
  title: "Order Details"
};

/**
 * Defines an asynchronous component that retrieves and displays order details.
 * `props` is an object containing route parameters.
 * - `params` is a Promise that resolves to an object with:
 *   - `id`: A string representing the order ID retrieved from the URL.
 */
const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params; // Waits for the `params` Promise to resolve and extracts the route parameters.

  // const session = await auth();

  const { id } = params; // Destructures the `id` property from the resolved `params` object.

  const order = await getOrderById(id); // Fetches order details using the extracted order ID.

  if (!order) notFound(); // Redirects to a "not found" page if the order does not exist.

  // Redirect the user if they don't own the order
  // if (order.userId !== session?.user?.id && session?.user?.role !== "admin") {
  //   return redirect("/unauthorized");
  // }

  return (
    // Renders the order details table, passing the fetched order data as a prop.
    <OrderDetailsTable
      order={{
        ...order, // Spreads the order data to include all existing properties.
        shippingAddress: order.shippingAddress as ShippingAddress // Ensures `shippingAddress` is correctly typed as `ShippingAddress`.
      }}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
    />
  );
};

export default OrderDetailsPage;
