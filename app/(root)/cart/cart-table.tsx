/**
 * This code defines a shopping cart table component for the application.
 * It includes components for adding and removing items from the cart, displaying the cart items in a table,
 * and showing the subtotal and a button to proceed to checkout. The code uses the Sonner library for toast notifications,
 * and manages transitions and state using React hooks.
 */

"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { ArrowRight, Loader, Minus, Plus } from "lucide-react";
import { Cart, CartItem } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// Component for the "Add to Cart" button
function AddButton({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition(); // Manages the transition state for the button.

  // Handles adding item to the cart
  return (
    <Button
      disabled={isPending} // Disables the button while the transition is pending.
      variant="outline"
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await addItemToCart(item); // Adds the item to the cart.

          // Shows an error toast if adding to the cart fails.
          if (!res.success) {
            toast.error(res.message);
          }
        })
      }
    >
      {/* Displays a loading spinner while the action is pending, otherwise shows a plus icon. */}
      {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
    </Button>
  );
}

// Component for the "Remove from Cart" button
function RemoveButton({ item }: { item: CartItem }) {
  const [isPending, startTransition] = useTransition(); // Manages the transition state for the button.

  // Handles removing item from the cart
  return (
    <Button
      disabled={isPending} // Disables the button while the transition is pending.
      variant="outline"
      type="button"
      onClick={() =>
        startTransition(async () => {
          const res = await removeItemFromCart(item.productId); // Removes the item from the cart.

          // Shows an error toast if removing from the cart fails.
          if (!res.success) {
            toast.error(res.message);
          }
        })
      }
    >
      {/* Displays a loading spinner while the action is pending, otherwise shows a minus icon. */}
      {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
    </Button>
  );
}

// Component for the cart table - It accepts a `cart` prop of type `Cart` or `undefined`.
const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter(); // Initializes the router for navigation.
  const [isPending, startTransition] = useTransition(); // Manages the transition state.

  return (
    <>
      <h1 className="py-4 h2-bold">Shopping Cart</h1>
      {/* Displays a message if the cart is empty */}
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Maps through the cart items and displays them in the table */}
                {cart.items.map(item => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link href={`/product/${item.slug}`} className="flex items-center">
                        <Image src={item.image} alt={item.name} width={50} height={50} />
                        <span className="px-2">{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="flex-center gap-2">
                      <RemoveButton item={item} />
                      <span>{item.qty}</span>
                      <AddButton item={item} />
                    </TableCell>
                    <TableCell className="text-right">${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Card>
            <CardContent className="p-4 gap-4">
              <div className="pb-3 text-xl">
                {/* Displays the subtotal of the cart */}
                Subtotal ({cart.items.reduce((a, c) => a + c.qty, 0)}):
                <span className="font-bold">{formatCurrency(cart.itemsPrice)}</span>
              </div>
              <Button className="w-full" disabled={isPending} onClick={() => startTransition(() => router.push("/shipping-address"))}>
                {/* Displays a loading spinner while the action is pending, otherwise shows an arrow icon. */}
                {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;
