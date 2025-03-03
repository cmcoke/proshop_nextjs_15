/**
 * This component, CheckoutSteps, renders the steps involved in the checkout process.
 * It highlights the current step and provides a visual representation of the progress.
 */

import React from "react";
import { cn } from "@/lib/utils";

const CheckoutSteps = ({ current = 0 }) => {
  return (
    <div className="flex-between flex-col md:flex-row space-x-2 space-y-2 mb-10">
      {/* Maps through the array of steps and renders each step */}
      {["User Login", "Shipping Address", "Payment Method", "Place Order"].map((step, index) => (
        // Creates a React fragment for each step to group multiple elements without adding extra nodes to the DOM
        <React.Fragment key={step}>
          {/* Conditionally applies styles to highlight the current step */}
          <div className={cn("p-2 w-56 rounded-full text-center text-sm", index === current ? "bg-secondary" : "")}>{step}</div>
          {/* Renders a horizontal line (hr) between steps, except after the last step */}
          {step !== "Place Order" && <hr className="w-16 border-t border-gray-300 mx-2" />}
        </React.Fragment>
      ))}
    </div>
  );
};
export default CheckoutSteps;
