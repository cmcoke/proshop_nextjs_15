/**
 *
 */

"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem, PaymentResult } from "@/types";
import { convertToPlainObject } from "../utils";
import { revalidatePath } from "next/cache";
import { paypal } from "../paypal";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

// Create an order
export async function createOrder() {
  try {
    const session = await auth(); //
    if (!session) throw new Error("User is not authenticated"); //

    const cart = await getMyCart(); //

    const userId = session?.user?.id; //

    if (!userId) throw new Error("User not found"); //

    const user = await getUserById(userId); //

    //
    if (!cart || cart.items.length === 0) {
      return { success: false, message: "Your cart is empty", redirectTo: "/cart" };
    }

    //
    if (!user.address) {
      return { success: false, message: "Please add a shipping address", redirectTo: "/shipping-address" };
    }

    //
    if (!user.paymentMethod) {
      return { success: false, message: "Please select a payment method", redirectTo: "/payment-method" };
    }

    // Create order object
    const order = insertOrderSchema.parse({
      userId: user.id, //
      shippingAddress: user.address, //
      paymentMethod: user.paymentMethod, //
      itemsPrice: cart.itemsPrice, //
      shippingPrice: cart.shippingPrice, //
      taxPrice: cart.taxPrice, //
      totalPrice: cart.totalPrice //
    });

    // Create a transaction to create order and order items in the database
    const insertedOrderId = await prisma.$transaction(async tx => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });

      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        //
        await tx.orderItem.create({
          //
          data: {
            ...item, //
            price: item.price, //
            orderId: insertedOrder.id //
          }
        });
      }
      // Clear cart
      await tx.cart.update({
        where: { id: cart.id }, //
        //
        data: {
          items: [], //
          totalPrice: 0, //
          shippingPrice: 0, //
          taxPrice: 0, //
          itemsPrice: 0 //
        }
      });

      return insertedOrder.id; //
    });

    //
    if (!insertedOrderId) throw new Error("Order not created");

    //
    return { success: true, message: "Order successfully created", redirectTo: `/order/${insertedOrderId}` };
  } catch (error) {
    //
    if (isRedirectError(error)) throw error; //
    return { success: false, message: formatError(error) }; //
  }
}

// Get order by id
export async function getOrderById(orderId: string) {
  //
  const data = await prisma.order.findFirst({
    //
    where: {
      id: orderId //
    },
    //
    include: {
      orderitems: true, //
      user: { select: { name: true, email: true } } //
    }
  });
  return convertToPlainObject(data); //
}

// Create a Paypal Order
export async function createPayPalOrder(orderId: string) {
  try {
    // Get order from database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId
      }
    });
    if (order) {
      // Create a paypal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      // Update the order with the paypal order id
      await prisma.order.update({
        where: {
          id: orderId
        },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: "",
            status: "",
            pricePaid: "0"
          }
        }
      });

      // Return the paypal order id
      return {
        success: true,
        message: "PayPal order created successfully",
        data: paypalOrder.id
      };
    } else {
      throw new Error("Order not found");
    }
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Approve Paypal Order
export async function approvePayPalOrder(orderId: string, data: { orderID: string }) {
  try {
    // Find the order in the database
    const order = await prisma.order.findFirst({
      where: {
        id: orderId
      }
    });

    //
    if (!order) throw new Error("Order not found");

    // Check if the order is already paid
    const captureData = await paypal.capturePayment(data.orderID); //

    //
    if (!captureData || captureData.id !== (order.paymentResult as PaymentResult)?.id || captureData.status !== "COMPLETED") throw new Error("Error in paypal payment");

    // Update order to paid
    await updateOrderToPaid({
      orderId, //
      paymentResult: {
        id: captureData.id, //
        status: captureData.status, //
        email_address: captureData.payer.email_address, //
        pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value //
      }
    });

    //
    revalidatePath(`/order/${orderId}`);

    //
    return {
      success: true,
      message: "Your order has been successfully paid by PayPal"
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

// Update Order to Paid in Database
async function updateOrderToPaid({ orderId, paymentResult }: { orderId: string; paymentResult?: PaymentResult }) {
  // Find the order in the database and include the order items
  const order = await prisma.order.findFirst({
    where: {
      id: orderId
    },
    include: {
      orderitems: true
    }
  });

  //
  if (!order) throw new Error("Order not found");

  //
  if (order.isPaid) throw new Error("Order is already paid");

  // Transaction to update the order and update the product quantities
  await prisma.$transaction(async tx => {
    // Update all item quantities in the database
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId }, //
        data: { stock: { increment: -item.qty } } //
      });
    }

    // Set the order to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true, //
        paidAt: new Date(), //
        paymentResult //
      }
    });
  });

  // Get the updated order after the transaction
  const updatedOrder = await prisma.order.findFirst({
    where: {
      id: orderId //
    },
    include: {
      orderitems: true, //
      user: { select: { name: true, email: true } } //
    }
  });

  //
  if (!updatedOrder) {
    throw new Error("Order not found");
  }
}

// Get user's orders
export async function getMyOrders({ limit = PAGE_SIZE, page }: { limit?: number; page: number }) {
  const session = await auth(); //
  if (!session) throw new Error("User is not authenticated"); //

  //
  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id }, //
    orderBy: { createdAt: "desc" }, //
    take: limit, //
    skip: (page - 1) * limit //
  });

  //
  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id } //
  });

  //
  return {
    data, //
    totalPages: Math.ceil(dataCount / limit) //
  };
}

// Defines the structure of the sales data used for monthly sales reports.
type SalesDataType = {
  month: string; // Represents the month in MM/YY format.
  totalSales: number; // Stores the total sales for that month.
}[];

// Get sales data and order summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count(); // Counts the total number of orders in the database.
  const productsCount = await prisma.product.count(); // Counts the total number of products in the database.
  const usersCount = await prisma.user.count(); // Counts the total number of registered users in the database.

  // Calculate total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true } // Sums up the total price of all orders to get the overall revenue.
  });

  /* 
    Get monthly sales:
      Retrieves monthly sales data from the "Order" table using a raw SQL query.
      This query extracts the creation date of orders, formats it as 'MM/YY', 
      sums up total sales for each month, and groups the results accordingly.
  */
  const salesDataRaw = await prisma.$queryRaw<Array<{ month: string; totalSales: Prisma.Decimal }>>`
  
  -- Formats the "createdAt" timestamp into 'MM/YY' format to group sales data by month. Example: If an order was created on 2025-03-15, it will be stored as '03/25'.
  SELECT 
    to_char("createdAt", 'MM/YY') as "month",

    -- Calculates total sales per month by summing up the "totalPrice" of all orders that fall within the same 'MM/YY' period.
    sum("totalPrice") as "totalSales"
    
    -- Retrieves data from the "Order" table where orders are stored. 
    FROM "Order"  

    -- Groups the results by the formatted month, ensuring that sales totals are aggregated for each distinct 'MM/YY' period.
    GROUP BY to_char("createdAt", 'MM/YY')`;

  // Convert raw sales data into the required format
  const salesData: SalesDataType = salesDataRaw.map(entry => ({
    month: entry.month, // Assigns the formatted month value.
    totalSales: Number(entry.totalSales) // Converts Prisma.Decimal to a regular number for easier usage.
  }));

  // Get latest sales
  const latestOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" }, // Orders the results by the order creation date in descending order (newest first).
    include: {
      user: { select: { name: true } } // Includes the user's name in the returned order details.
    },
    take: 6 // Limits the result to the 6 most recent orders.
  });

  return {
    ordersCount, // Total number of orders.
    productsCount, // Total number of products.
    usersCount, // Total number of registered users.
    totalSales, // Total revenue from all orders.
    latestOrders, // The latest 6 orders.
    salesData // Monthly sales data formatted in an array.
  };
}

/* 
   Retrieves all orders for the admin panel with pagination support.

   Parameters:
   - `limit` (optional): Specifies the number of orders per page. Defaults to `PAGE_SIZE`.
   - `page`: The current page number for pagination.

   Returns:
   - `data`: An array of orders with user details.
   - `totalPages`: The total number of pages based on the number of orders and the limit.
*/
export async function getAllOrders({ limit = PAGE_SIZE, page }: { limit?: number; page: number }) {
  /*
     Fetches a paginated list of orders from the database.
     - Orders are sorted in descending order based on `createdAt` (latest first).
     - `take: limit` → Limits the number of orders retrieved per page.
     - `skip: (page - 1) * limit` → Skips records to fetch the correct page.
     - `include: { user: { select: { name: true } } }` → Includes the user's name for each order.
  */
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } }
  });

  /* 
     Counts the total number of orders in the database 
     to determine the total number of pages.
  */
  const dataCount = await prisma.order.count();

  /* 
     Returns the retrieved orders and calculates the total pages. 
     - `totalPages` is determined by dividing `dataCount` by `limit` and rounding up.
  */
  return {
    data,
    totalPages: Math.ceil(dataCount / limit)
  };
}

/*
  Deletes a specific order from the database based on its ID.

  Parameters:
  - `id`: The unique identifier of the order to be deleted.

  Returns:
  - An object containing `success` (true/false) and a `message` indicating the result of the deletion.
*/
export async function deleteOrder(id: string) {
  try {
    /*
      Deletes the order from the database using Prisma.
      - `prisma.order.delete`: Executes the delete operation on the "order" table.
      - `{ where: { id } }`: Specifies the condition to identify the order to delete based on its unique `id`.
    */
    await prisma.order.delete({ where: { id } });

    /*
      Triggers revalidation of the "/admin/orders" path to ensure the updated data is reflected in the UI.
      - `revalidatePath`: This is used to re-fetch or re-render the page with the updated order data.
    */
    revalidatePath("/admin/orders");

    /*
      Returns a success response after the order is deleted successfully.
      - `success: true`: Indicates that the operation was successful.
      - `message: "Order deleted successfully"`: A success message for confirmation.
    */
    return {
      success: true,
      message: "Order deleted successfully"
    };
  } catch (error) {
    /*
      Catches any error that occurs during the deletion process.
      - Returns a failure response with the error message formatted using `formatError`.
    */
    return { success: false, message: formatError(error) };
  }
}

/*
  Updates an order's payment status to "paid" when using Cash on Delivery (COD).

  Parameters:
  - `orderId`: The unique identifier of the order being marked as paid.

  Returns:
  - An object with `success: true` if the update is successful.
  - An object with `success: false` and an error message if the update fails.
*/
export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    /*
      Calls the `updateOrderToPaid` function to update the order's payment status.
      - `{ orderId }`: Passes the order's unique identifier to the function.
    */
    await updateOrderToPaid({ orderId });

    /*
      Revalidates the specific order page to ensure the UI reflects the updated payment status.
      - `/order/${orderId}`: The path of the order page that needs to be refreshed.
    */
    revalidatePath(`/order/${orderId}`);

    /*
      Returns a success response after updating the order.
      - `success: true`: Indicates that the operation was successful.
      - `message: "Order paid successfully"`: Confirmation message for the update.
    */
    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    /*
      Catches any error that occurs during the update process.
      - Returns a failure response with the error message formatted using `formatError`.
    */
    return { success: false, message: formatError(err) };
  }
}

/*
  Marks an order as delivered in the database.

  Parameters:
  - `orderId`: The unique identifier of the order being marked as delivered.

  Returns:
  - An object with `success: true` and a success message if the update is successful.
  - An object with `success: false` and an error message if the update fails.
*/
export async function deliverOrder(orderId: string) {
  try {
    /*
      Retrieves the order from the database using its unique identifier.
      - `findFirst()`: Finds the first order that matches the given `id`.
    */
    const order = await prisma.order.findFirst({
      where: {
        id: orderId // Searches for an order with the given ID.
      }
    });

    /*
      If the order does not exist, an error is thrown.
      - Prevents updating a non-existent order.
    */
    if (!order) throw new Error("Order not found");

    /*
      If the order is not paid, an error is thrown.
      - Ensures that only paid orders can be marked as delivered.
    */
    if (!order.isPaid) throw new Error("Order is not paid");

    /*
      Updates the order status to "delivered" in the database.
      - `isDelivered: true`: Marks the order as delivered.
      - `deliveredAt: new Date()`: Stores the current timestamp as the delivery date.
    */
    await prisma.order.update({
      where: { id: orderId }, // Finds the order by its ID.
      data: {
        isDelivered: true, // Updates the delivery status.
        deliveredAt: new Date() // Sets the delivery timestamp.
      }
    });

    /*
      Revalidates the specific order page to ensure the UI reflects the updated delivery status.
      - `/order/${orderId}`: The path of the order page that needs to be refreshed.
    */
    revalidatePath(`/order/${orderId}`);

    /*
      Returns a success response after updating the order status.
      - `success: true`: Indicates that the operation was successful.
      - `message: "Order delivered successfully"`: Confirmation message for the update.
    */
    return { success: true, message: "Order delivered successfully" };
  } catch (err) {
    /*
      Catches any error that occurs during the update process.
      - Returns a failure response with the error message formatted using `formatError`.
    */
    return { success: false, message: formatError(err) };
  }
}
