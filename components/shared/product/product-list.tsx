/**
 * This code block defines the `ProductList` component,
 * which renders a list of product cards and supports
 * optional title and limit props to customize the display.
 **/

import ProductCard from "./product-card"; // Imports the ProductCard component for displaying individual products.
import { Product } from "@/types"; // Imports the Product type definition.

/**
 * This function `ProductList` renders a list of products.
 * @param title - Optional string representing the title of the product list.
 * @param data - Array of Product objects to be displayed.
 * @param limit - Optional number representing the maximum number of products to display.
 **/
const ProductList = ({ title, data, limit }: { title?: string; data: Product[]; limit?: number }) => {
  const limitedData = limit ? data.slice(0, limit) : data; // Limits the data array to the specified limit, if provided.

  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>
      {/* Renders the product cards in a responsive grid layout */}
      {limitedData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {limitedData.map((product: Product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        // Displays a message if no products are found.
        <div>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
