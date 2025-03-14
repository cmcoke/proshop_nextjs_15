export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Prostore";
export const APP_DESCRIPTION = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A modern store built with Next.js";
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT = Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;
export const signInDefaultValues = {
  email: "",
  password: ""
};
export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export const shippingAddressDefaultValues = {
  fullName: "",
  streetAddress: "",
  city: "",
  postalCode: "",
  country: ""
};

// Defines an array of payment methods. If the environment variable PAYMENT_METHODS is set, it splits the string into an array of payment methods.
// If the environment variable is not set, it defaults to an array containing "PayPal", "Stripe", and "CashOnDelivery".
export const PAYMENT_METHODS = process.env.PAYMENT_METHODS ? process.env.PAYMENT_METHODS.split(", ") : ["PayPal", "Stripe", "CashOnDelivery"];

// Defines the default payment method. If the environment variable DEFAULT_PAYMENT_METHOD is set, it uses its value.
// If the environment variable is not set, it defaults to "PayPal".
export const DEFAULT_PAYMENT_METHOD = process.env.DEFAULT_PAYMENT_METHOD || "PayPal";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

export const productDefaultValues = {
  name: "",
  slug: "",
  category: "",
  images: [],
  brand: "",
  description: "",
  price: "0",
  stock: 0,
  rating: "0",
  numReviews: "0",
  isFeatured: false,
  banner: null
};

/*
  Defines the `USER_ROLES` constant, which determines the available user roles in the application.

  - It first checks if the `USER_ROLES` environment variable is defined.
  - If `USER_ROLES` exists, it splits the string by ", " to create an array of roles.
  - If `USER_ROLES` is not set, it defaults to `["admin", "user"]`.
*/
export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ") // Converts a comma-separated string into an array of roles
  : ["admin", "user"]; // Default roles if no environment variable is set

export const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0
};
