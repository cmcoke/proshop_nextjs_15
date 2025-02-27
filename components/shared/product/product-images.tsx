/**
 * This code block defines the `ProductImages` component,
 * which displays a gallery of product images and allows
 * users to select a specific image to view in larger detail.
 **/

"use client";

import Image from "next/image"; // Imports the Image component from Next.js for optimized image loading.
import { cn } from "@/lib/utils"; // Imports the cn utility function for conditional class names.
import { useState } from "react"; // Imports the useState hook from React for state management.

/**
 * This function `ProductImages` defines a component that displays
 * a set of product images and allows the user to select and view
 * an image in larger detail.
 * @param images - Array of strings representing the URLs of product images.
 **/
const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0); // Initializes the current state to track the selected image index.

  return (
    <div className="space-y-4">
      <Image src={images![current]} alt="hero image" width={1000} height={1000} priority={true} className="min-h-[300px] object-cover object-center " />
      {/* Displays the currently selected image with specified dimensions and styles */}
      <div className="flex">
        {images.map((image, index) => (
          // Displays a thumbnail image with border and hover effects, sets the current image on click
          <div key={image} className={cn("border mr-2 cursor-pointer hover:border-orange-600", current === index && "border-orange-500")} onClick={() => setCurrent(index)}>
            <Image src={image} alt="image" width={100} height={100} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages; // Exports the ProductImages component as the default export.
