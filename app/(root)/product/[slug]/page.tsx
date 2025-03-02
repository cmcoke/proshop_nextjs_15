/**
 * This code block defines the `ProductDetailsPage` component,
 * which fetches and displays detailed information about a product
 * including images, price, brand, category, rating, description, and stock status.
 **/

import { notFound } from "next/navigation"; // Imports the notFound function for handling cases where a product is not found.
import ProductPrice from "@/components/shared/product/product-price"; // Imports the ProductPrice component for displaying product prices.
import { Card, CardContent } from "@/components/ui/card"; // Imports Card components from the UI library.
import { getProductBySlug } from "@/lib/actions/product.actions"; // Imports the getProductBySlug function for fetching product data.
import { Badge } from "@/components/ui/badge"; // Imports the Badge component from the UI library.
import ProductImages from "@/components/shared/product/product-images"; // Imports the ProductImages component for displaying product images.
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";

/**
 * This function `ProductDetailsPage` fetches and displays details about a specific product.
 * @param props - Object containing parameters including the product slug.
 **/
const ProductDetailsPage = async (props: { params: Promise<{ slug: string }> }) => {
  const { slug } = await props.params; // Destructures the slug from the props parameters.

  const product = await getProductBySlug(slug); // Fetches the product data based on the slug.

  if (!product) notFound(); // If the product is not found, call the notFound function.

  const cart = await getMyCart();

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-5">
        {/* Images Column */}
        <div className="col-span-2">
          <ProductImages images={product.images!} />
        </div>

        {/* Details Column */}
        <div className="col-span-2 p-5">
          <div className="flex flex-col gap-6">
            <p>
              {product.brand} {product.category}
            </p>
            <h1 className="h3-bold">{product.name}</h1>
            <p>
              {product.rating} of {product.numReviews} reviews
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ProductPrice value={Number(product.price)} className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2" />
            </div>
          </div>
          <div className="mt-10">
            <p>Description:</p>
            <p>{product.description}</p>
          </div>
        </div>
        {/* Action Column */}
        <div>
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex justify-between">
                <div>Price</div>
                <div>
                  <ProductPrice value={Number(product.price)} />
                </div>
              </div>
              <div className="mb-2 flex justify-between">
                <div>Status</div>
                {/* Displays the product stock */}
                {product.stock > 0 ? <Badge variant="outline">In stock</Badge> : <Badge variant="destructive">Unavailable</Badge>}
              </div>
              {/* Displays the "Add to cart" button if the product is in stock. */}
              {product.stock > 0 && (
                <div className=" flex-center">
                  <AddToCart
                    cart={cart}
                    item={{
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      qty: 1,
                      image: product.images![0]
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
