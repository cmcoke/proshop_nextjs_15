import { cn } from "@/lib/utils";

const ProductPrice = ({ value, className }: { value: number; className?: string }) => {
  // Converts the numerical 'value' to a string with two decimal places.
  const stringValue = value.toFixed(2);

  // Splits the 'stringValue' into two parts: integer part ('intValue') and decimal part ('floatValue').
  const [intValue, floatValue] = stringValue.split(".");

  return (
    <p className={cn("text-2xl", className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">.{floatValue}</span>
    </p>
  );
};

export default ProductPrice;
