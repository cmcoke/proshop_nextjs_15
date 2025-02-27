/**
 * This code block defines the `ProductPrice` component,
 * which displays a formatted price with integer and fractional parts
 * styled appropriately using CSS classes.
 **/

import { cn } from "@/lib/utils"; // Imports the cn utility function for conditional class names.

/**
 * This function `ProductPrice` displays a formatted price value.
 * @param value - Number representing the price to be displayed.
 * @param className - Optional string representing additional CSS classes for styling.
 **/
const ProductPrice = ({ value, className }: { value: number; className?: string }) => {
  const stringValue = value.toFixed(2); // Converts the price value to a string with two decimal places.

  const [intValue, floatValue] = stringValue.split("."); // Splits the string value into integer and fractional parts.

  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {/* Displays the integer part of the price. */}
      {intValue}
      {/* Displays the fractional part of the price with small text size and aligned at the top. */}
      <span className="text-xs align-super">.{floatValue}</span>
    </p>
  );
};

export default ProductPrice;
