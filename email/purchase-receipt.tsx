/*
  PurchaseReceiptEmail Component
  
  - This component generates an email receipt for a purchase using @react-email/components.
  - It formats order details, including order ID, date, price, items, and payment details.
  - Uses Tailwind CSS for styling inside the email.
  - Dynamically generates email preview properties with a sample order.
*/

import { Body, Column, Container, Head, Heading, Html, Img, Preview, Row, Section, Tailwind, Text } from "@react-email/components"; // Import React Email components for email layout
import { formatCurrency } from "@/lib/utils"; // Utility function for formatting currency
import { Order } from "@/types"; // Import `Order` type for type safety
import sampleData from "@/db/sample-data"; // Import sample data for preview purposes

import dotenv from "dotenv"; // Import dotenv for loading environment variables
dotenv.config(); // Load environment variables from a `.env` file

// Define the props for the email component, which includes an order object
type OrderInformationProps = {
  order: Order;
};

/*
  Generate a sample order object for previewing the email.
  - Uses a randomly generated UUID as an order ID.
  - Contains dummy user and order details.
*/
PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(), // Generate a unique order ID
    userId: "123", // Dummy user ID
    user: {
      name: "John Doe",
      email: "test@test.com"
    },
    paymentMethod: "Stripe", // Payment method used for the purchase
    shippingAddress: {
      // Shipping address details
      fullName: "John Doe",
      streetAddress: "123 Main St",
      city: "New York",
      postalCode: "10001",
      country: "US"
    },
    createdAt: new Date(), // Order creation date
    totalPrice: "100", // Total price paid
    taxPrice: "10", // Tax amount
    shippingPrice: "10", // Shipping cost
    itemsPrice: "80", // Price of items before tax and shipping
    orderitems: sampleData.products.map(x => ({
      name: x.name, // Product name
      orderId: "123", // Order ID associated with the product
      productId: "123", // Product ID
      slug: x.slug, // Product slug (URL-friendly name)
      qty: x.stock, // Quantity ordered
      image: x.images[0], // First image of the product
      price: x.price.toString() // Product price as a string
    })),
    isDelivered: true, // Indicates if the order has been delivered
    deliveredAt: new Date(), // Delivery date
    isPaid: true, // Indicates if the order has been paid for
    paidAt: new Date(), // Payment date
    paymentResult: {
      // Payment transaction details
      id: "123",
      status: "succeeded",
      pricePaid: "100",
      email_address: "test@test.com"
    }
  }
} satisfies OrderInformationProps;

// Date formatter to display the order date in a readable format
const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

/*
  PurchaseReceiptEmail Component
  
  - Generates an HTML email layout displaying order details.
  - Uses React Email components for structure and Tailwind CSS for styling.
  - Displays order ID, purchase date, total price, and order items.
  - Uses a table layout for an organized email format.
*/
export default function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      {" "}
      {/* Root HTML container */}
      <Preview>View order receipt</Preview> {/* Email preview text */}
      <Tailwind>
        {" "}
        {/* Enables Tailwind CSS inside the email */}
        <Head /> {/* Email head section */}
        <Body className="font-sans bg-white">
          {" "}
          {/* Email body with styling */}
          <Container className="max-w-xl">
            {" "}
            {/* Container for the email content */}
            <Heading>Purchase Receipt</Heading> {/* Email heading */}
            <Section>
              {" "}
              {/* Order summary section */}
              <Row>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">Order ID</Text>
                  <Text className="mt-0 mr-4">{order.id.toString()}</Text> {/* Display order ID */}
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">Purchase Date</Text>
                  <Text className="mt-0 mr-4">{dateFormatter.format(order.createdAt)}</Text> {/* Display order date */}
                </Column>
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap">Price Paid</Text>
                  <Text className="mt-0 mr-4">{formatCurrency(order.totalPrice)}</Text> {/* Display total price */}
                </Column>
              </Row>
            </Section>
            {/* Order items section */}
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.orderitems.map(item => (
                <Row key={item.productId} className="mt-8">
                  {" "}
                  {/* Loop through ordered items */}
                  <Column className="w-20">
                    <Img width="80" alt={item.name} className="rounded" src={item.image.startsWith("/") ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}` : item.image} /> {/* Display product image */}
                  </Column>
                  <Column className="align-top">
                    {item.name} x {item.qty} {/* Display product name and quantity */}
                  </Column>
                  <Column align="right" className="align-top">
                    {formatCurrency(item.price)} {/* Display product price */}
                  </Column>
                </Row>
              ))}

              {/* Summary of prices (items, tax, shipping, total) */}
              {[
                { name: "Items", price: order.itemsPrice },
                { name: "Tax", price: order.taxPrice },
                { name: "Shipping", price: order.shippingPrice },
                { name: "Total", price: order.totalPrice }
              ].map(({ name, price }) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}: </Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-0">{formatCurrency(price)}</Text> {/* Format and display price */}
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
