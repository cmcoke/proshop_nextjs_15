/**
 * This component, placeOrderPage, handles the display and functionality for placing an order.
 * It fetches the user's cart and user information, validates the information, and displays the order details,
 * including the shipping address, payment method, and order items. The user can review and edit these details before placing the order.
 */

import Image from "next/image"; // Imports the Image component from next/image for optimized images.
import Link from "next/link"; // Imports the Link component from next/link for navigation links.
import { redirect } from "next/navigation"; // Imports the redirect function for navigation.
import React from "react"; // Imports React for creating React components.
import { auth } from "@/auth"; // Imports the auth function for user authentication.
import CheckoutSteps from "@/components/shared/checkout-steps"; // Imports the CheckoutSteps component to display the checkout steps.
import { Button } from "@/components/ui/button"; // Imports the Button component from the UI library.
import { Card, CardContent } from "@/components/ui/card"; // Imports Card and CardContent components from the UI library.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Imports Table components from the UI library.
import { getMyCart } from "@/lib/actions/cart.actions"; // Imports the getMyCart function to fetch the user's cart.
import { getUserById } from "@/lib/actions/user.actions"; // Imports the getUserById function to fetch the user by ID.
import { formatCurrency } from "@/lib/utils"; // Imports the formatCurrency function to format currency values.
import { ShippingAddress } from "@/types"; // Imports the ShippingAddress type.
import PlaceOrderForm from "./place-order-form"; // Imports the PlaceOrderForm component for placing the order.

// Defines the metadata for the page.
export const metadata = {
  title: "Place Order" // Sets the title of the page to "Place Order".
};

// Defines the placeOrderPage component as an asynchronous function.
const placeOrderPage = async () => {
  const cart = await getMyCart(); // Fetches the user's cart.

  const session = await auth(); // Retrieves the current user session.

  const userId = session?.user?.id; // Extracts the user ID from the session.

  // Throws an error if the user ID is not found.
  if (!userId) {
    throw new Error("User ID not found");
  }

  const user = await getUserById(userId); // Fetches the user information by user ID.

  // Redirects to the cart page if the cart is empty or not found.
  if (!cart || cart.items.length === 0) redirect("/cart");

  // Redirects to the shipping address page if the user address is not found.
  if (!user.address) redirect("/shipping-address");

  // Redirects to the payment method page if the user's payment method is not found.
  if (!user.paymentMethod) redirect("/payment-method");

  const userAddress = user.address as ShippingAddress; // Casts the user's address to the ShippingAddress type.

  return (
    <>
      <CheckoutSteps current={3} /> {/* Displays the checkout steps with the current step highlighted. */}
      <h1 className="py-4 text-2xl">Place Order</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="overflow-x-auto md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city}, {userAddress.postalCode}, {userAddress.country}{" "}
              </p>
              <div className="mt-3">
                <Link href="/shipping-address">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{user.paymentMethod}</p>
              <div className="mt-3">
                <Link href="/payment-method">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Maps through the items in the cart to render table rows for each item. */}
                  {cart.items.map(item => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link href={`/product/${item.slug}`} className="flex items-center">
                          <Image src={item.image} alt={item.name} width={50} height={50}></Image>
                          <span className="px-2">{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="px-2">{item.qty}</span>
                      </TableCell>
                      <TableCell className="text-right">${item.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Link href="/cart">
                <Button variant="outline">Edit</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 gap-4 space-y-4">
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderForm /> {/* Renders the PlaceOrderForm component for placing the order. */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default placeOrderPage;
