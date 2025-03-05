import { clsx, type ClassValue } from "clsx"; // Imports the clsx function and ClassValue type from clsx.
import { twMerge } from "tailwind-merge"; // Imports the twMerge function from tailwind-merge.

/**
 * This function `cn` merges class names using clsx and tailwind-merge.
 * @param inputs - Array of class values to be merged.
 * @returns A string of merged class names.
 **/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Merges the class values using clsx and tailwind-merge.
}

/**
 * Convert prisma object into a regular JS object
 * This function `convertToPlainObject` converts a Prisma object into a regular JavaScript object.
 * @param value - The Prisma object to be converted.
 * @returns A plain JavaScript object.
 **/
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)); // Converts the value to a plain object using JSON methods.
}

/**
 * Format number with decimal places
 * This function `formatNumberWithDecimal` formats a number with two decimal places.
 * @param num - The number to be formatted.
 * @returns A string representing the formatted number.
 **/
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split("."); // Splits the number into integer and decimal parts.
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`; // Pads the decimal part with zeros if needed.
}

/**
 * Format Errors
 * This function `formatError` formats different types of errors into user-friendly messages.
 * @param error - The error object to be formatted.
 * @returns A string representing the formatted error message.
 **/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any): string {
  if (error.name === "ZodError") {
    // Handle Zod error
    const fieldErrors = Object.keys(error.errors).map(field => {
      const message = error.errors[field].message; // Retrieves the error message for each field.
      return typeof message === "string" ? message : JSON.stringify(message); // Converts the message to string if necessary.
    });

    return fieldErrors.join(". "); // Joins the field error messages into a single string.
  } else if (error.name === "PrismaClientKnownRequestError" && error.code === "P2002") {
    // Handle Prisma error
    const field = error.meta?.target ? error.meta.target[0] : "Field"; // Retrieves the field name from the error metadata.
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`; // Formats the error message indicating the field already exists.
  } else {
    // Handle other errors
    return typeof error.message === "string" ? error.message : JSON.stringify(error.message); // Converts the message to string if necessary.
  }
}

//  This function `round2` takes a number or string input and rounds it to 2 decimal places. It handles both number and string inputs, converting and rounding as needed, ensuring precision with floating-point operations.
export const round2 = (value: number | string) => {
  if (typeof value === "number") {
    // Adds a small constant (Number.EPSILON) to the value to avoid floating-point precision issues,
    // then multiplies by 100 to shift the decimal point, rounds to the nearest whole number,
    // and finally divides by 100 to shift the decimal point back, resulting in a number rounded to 2 decimal places.
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    // Converts the string value to a number, adds a small constant (Number.EPSILON) to avoid floating-point precision issues,
    // then multiplies by 100 to shift the decimal point, rounds to the nearest whole number,
    // and finally divides by 100 to shift the decimal point back, resulting in a number rounded to 2 decimal places.
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("value is not a number nor a string");
  }
};

// Creates a new instance of the Intl.NumberFormat object for formatting numbers as currency.
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD", // Sets the currency to USD (United States Dollar).
  style: "currency", // Specifies the formatting style as currency.
  minimumFractionDigits: 2 // Ensures that the formatted number has at least 2 decimal places.
});

// Function to format a given amount as currency.
export function formatCurrency(amount: number | string | null) {
  // If the amount is a number, formats it as currency using CURRENCY_FORMATTER.
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
    // If the amount is a string, converts it to a number and then formats it as currency using CURRENCY_FORMATTER.
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
    // If the amount is neither a number nor a string, returns "NaN" (Not a Number) to indicate an invalid value.
  } else {
    return "NaN";
  }
}

// Shorten UUID to 6 characters
export function formatId(id: string) {
  // Returns a string consisting of two dots followed by the last 6 characters of the input string 'id'.
  return `..${id.substring(id.length - 6)}`;
}

// Testing purposes
// const id1 = "439dde63-541a-4cc9-891a-ffeae193abc0";
// console.log(formatId(id1)); // Expected: "..93abc0"
// const id2 = "1234567890abcdef";
// console.log(formatId(id2)); // Expected: "..abcdef"

// Format the date in 3 different ways (Date & Time, Date Only, Time Only)
export const formatDateTime = (dateString: Date) => {
  // Options for formatting the date and time
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true // use 12-hour clock (true) or 24-hour clock (false)
  };

  // Options for formatting the date only
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric" // numeric day of the month (e.g., '25')
  };

  // Options for formatting the time only
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString("en-US", dateTimeOptions); // Formats the date and time string using the 'dateTimeOptions' options.

  const formattedDate: string = new Date(dateString).toLocaleString("en-US", dateOptions); // Formats the date string using the 'dateOptions' options.

  const formattedTime: string = new Date(dateString).toLocaleString("en-US", timeOptions); // Formats the time string using the 'timeOptions' options.

  // Returns an object with formatted date and time, date only, and time only strings
  return {
    dateTime: formattedDateTime, // The formatted date and time string.
    dateOnly: formattedDate, // The formatted date string.
    timeOnly: formattedTime // The formatted time string.
  };
};

// // Import or copy the function here if necessary
// const testDate = new Date("2023-10-25T08:30:00Z"); // Example date string

// // Call the formatDateTime function
// const formatted = formatDateTime(testDate);

// // Log the results
// console.log("Full DateTime:", formatted.dateTime); // Expected output: "Oct 25, 2023, 1:30 AM" (adjusted for timezone)
// console.log("Date Only:", formatted.dateOnly); // Expected output: "Wed, Oct 25, 2023"
// console.log("Time Only:", formatted.timeOnly); // Expected output: "1:30 AM" (adjusted for timezone)
