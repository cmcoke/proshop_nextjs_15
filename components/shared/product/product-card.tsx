/**
 * This code block defines the `ProductCard` component,
 * which is responsible for displaying individual product details
 * including the image, brand, name, rating, price, and stock status.
 **/

import Image from "next/image"; // Imports the Image component from Next.js for optimized image loading.
import Link from "next/link"; // Imports the Link component from Next.js for client-side navigation.
import { Product } from "@/types"; // Imports the Product type definition.
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Imports Card components from the UI library.
import ProductPrice from "./product-price"; // Imports the ProductPrice component for displaying product prices.
import Rating from "./rating";

/**
 * This function `ProductCard` defines a card component that displays product information.
 * @param product - Product object containing details about the product to be displayed.
 **/
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/product/${product.slug}`}>
          <Image priority={true} src={product.images![0]} alt={product.name} className="aspect-square object-cover rounded" height={300} width={300} />
        </Link>
      </CardHeader>
      <CardContent className="p-4 grid gap-4">
        <div className="text-xs">{product.brand}</div>
        <Link href={`/product/${product.slug}`}>
          <h2 className="text-sm font-medium">{product.name}</h2>
        </Link>
        <div className="flex-between gap-4">
          <Rating value={Number(product.rating)} />
          {/* Displays the product price if in stock, otherwise shows "Out of Stock" */}
          {product.stock > 0 ? <ProductPrice value={Number(product.price)} /> : <p className="text-destructive">Out of Stock</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
