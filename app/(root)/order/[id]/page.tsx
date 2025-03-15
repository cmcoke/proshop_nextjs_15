import { getOrderById } from "@/lib/actions/order.actions";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";
import { auth } from "@/auth";
import Stripe from "stripe";

export const metadata = {
  title: "Order Details"
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  // const session = await auth();

  const { id } = params;

  const order = await getOrderById(id);

  if (!order) notFound();

  // Redirect the user if they don't own the order
  // if (order.userId !== session?.user?.id && session?.user?.role !== "admin") {
  //   return redirect("/unauthorized");
  // }

  const session = await auth();

  let client_secret = null;

  // Check if using Stripe and not paid
  if (order.paymentMethod === "Stripe" && !order.isPaid) {
    // Initialize Stripe instance
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    // Create a new payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100),
      currency: "USD",
      metadata: { orderId: order.id }
    });
    client_secret = paymentIntent.client_secret;
  }

  return (
    // Renders the order details table, passing the fetched order data as a prop.
    <OrderDetailsTable
      order={{
        ...order, // Spreads the order data to include all existing properties.
        shippingAddress: order.shippingAddress as ShippingAddress // Ensures `shippingAddress` is correctly typed as `ShippingAddress`.
      }}
      stripeClientSecret={client_secret}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      isAdmin={session?.user.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
