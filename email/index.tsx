/*
  Sends a purchase receipt email using the Resend email service.

  Dependencies:
  - `Resend`: The Resend email service SDK for sending emails.
  - `SENDER_EMAIL`, `APP_NAME`: Constants for the sender email and application name.
  - `Order`: Type definition for an order object.
  - `PurchaseReceiptEmail`: React component used to generate the email content.
  - `dotenv`: Loads environment variables from a `.env` file.

  Parameters:
  - `order`: An object of type `Order` containing order details.

  Returns:
  - Sends an email using Resend and does not return any explicit value.
*/

import { Resend } from "resend"; // Import the Resend SDK to send emails
import { SENDER_EMAIL, APP_NAME } from "@/lib/constants"; // Import sender email and app name constants
import { Order } from "@/types"; // Import the `Order` type for type safety
import PurchaseReceiptEmail from "./purchase-receipt"; // Import the email template component

import dotenv from "dotenv"; // Import dotenv to load environment variables
dotenv.config(); // Load environment variables from a `.env` file

// Create an instance of the Resend email service using the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY as string);

/*
  Sends an email receipt to the user after a purchase.

  Parameters:
  - `order`: An object containing the order details, including the user’s email.
*/
export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  await resend.emails.send({
    from: `${APP_NAME} <${SENDER_EMAIL}>`, // Sets the sender email using app name and predefined sender email
    to: order.user.email, // Sends the email to the user's email address from the order object
    subject: `Order Confirmation ${order.id}`, // Sets the subject with the order ID
    react: <PurchaseReceiptEmail order={order} /> // Uses the `PurchaseReceiptEmail` component as the email body
  });
};
