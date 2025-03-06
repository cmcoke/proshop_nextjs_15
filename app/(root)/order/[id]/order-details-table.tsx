/**
 * This component, OrderDetailsTable, handles the display of order details.
 * It shows the order information, including the order ID, payment method, shipping address, order items, and order summary.
 * It also provides visual indicators for the payment and delivery statuses.
 */

"use client"; // Indicates that this code is intended to run on the client side.

import { Badge } from "@/components/ui/badge"; // Imports the Badge component from the UI library.
import { Card, CardContent } from "@/components/ui/card"; // Imports the Card and CardContent components from the UI library.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Imports Table components from the UI library.
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils"; // Imports utility functions for formatting currency, date and time, and IDs.
import { Order } from "@/types"; // Imports the Order type.
import Image from "next/image"; // Imports the Image component from next/image for optimized images.
import Link from "next/link"; // Imports the Link component from next/link for navigation links.
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { approvePayPalOrder, createPayPalOrder } from "@/lib/actions/order.actions";
import { toast } from "sonner";

const OrderDetailsTable = ({ order, paypalClientId }: { order: Order; paypalClientId: string }) => {
  // Destructures order properties for easier access.
  const { shippingAddress, orderitems, itemsPrice, taxPrice, shippingPrice, totalPrice, paymentMethod, isPaid, paidAt, isDelivered, deliveredAt } = order;

  // Checks the loading status of the PayPal script
  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer(); //

    let status = ""; //

    //
    if (isPending) {
      status = "Loading PayPal...";
    } else if (isRejected) {
      status = "Error in loading PayPal.";
    }
    return status;
  };

  // Creates a PayPal order
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id); //
    if (!res.success) toast.error(res.message); //
    return res.data; //
  };

  // Approves a PayPal order
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data); //

    //
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <h1 className="py-4 text-2xl"> Order {formatId(order.id)}</h1>
      <div className="grid md:grid-cols-3 md:gap-5">
        <div className="overflow-x-auto md:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Payment Method</h2>
              <p>{paymentMethod}</p>
              {/* Shows a badge indicating the payment status. */}
              {isPaid ? <Badge variant="secondary">Paid at {formatDateTime(paidAt!).dateTime}</Badge> : <Badge variant="destructive">Not paid</Badge>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl pb-4">Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}{" "}
              </p>
              {/* Shows a badge indicating the delivery status. */}
              {isDelivered ? <Badge variant="secondary">Delivered at {formatDateTime(deliveredAt!).dateTime}</Badge> : <Badge variant="destructive">Not delivered</Badge>}
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
                  {/* Maps through the order items to render table rows for each item. */}
                  {orderitems.map(item => (
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
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="p-4 space-y-4 gap-4">
              <h2 className="text-xl pb-4">Order Summary</h2>
              <div className="flex justify-between">
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {/* PayPal Payment */}
              {!isPaid && paymentMethod === "PayPal" && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons createOrder={handleCreatePayPalOrder} onApprove={handleApprovePayPalOrder} />
                  </PayPalScriptProvider>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;
