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
