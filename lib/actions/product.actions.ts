"use server";

import { prisma } from "@/db/prisma"; // Imports the prisma client instance for database operations.
import { convertToPlainObject, formatError } from "../utils"; // Imports the convertToPlainObject utility function.
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants"; // Imports the constant for the latest products limit.
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validator";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/*
  Fetches the latest products from the database, ordered by creation date.

  Returns:
  - An array of the most recently created product objects, converted to plain objects.
*/
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT, // Limits the number of products retrieved to the specified latest products limit.
    orderBy: { createdAt: "desc" } // Orders the products by creation date in descending order (newest first).
  });

  return convertToPlainObject(data); // Converts the retrieved data into plain JavaScript objects for better handling.
}

/*
  Fetches a single product from the database based on its unique slug.

  Parameters:
  - `slug`: A string representing the unique identifier (slug) of the product.

  Returns:
  - The product object if found, otherwise `null`.
*/
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug } // Searches for a product where the `slug` field matches the provided slug.
  });
}

/*
  Retrieves a paginated list of products with optional filters for search query, category, price, rating, and sorting.

  Parameters:
  - `query`: A search string used to filter products by name.
  - `limit`: The maximum number of products per page (default: `PAGE_SIZE`).
  - `page`: The current page number for pagination.
  - `category`: A filter to retrieve products by category.
  - `price`: A price range filter in the format "min-max".
  - `rating`: A minimum rating filter.
  - `sort`: Sorting criteria (e.g., "lowest", "highest", "rating").

  Returns:
  - An object containing:
    - `data`: The list of products matching the filters.
    - `totalPages`: The total number of pages based on the filtered product count.
*/
export async function getAllProducts({ query, limit = PAGE_SIZE, page, category, price, rating, sort }: { query: string; limit?: number; page: number; category?: string; price?: string; rating?: string; sort?: string }) {
  /*
    Creates a query filter for searching products by name.
    - Uses `contains` for partial matching.
    - `mode: "insensitive"` makes the search case-insensitive.
    - If `query` is "all" or empty, no filtering is applied.
  */
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive"
          } as Prisma.StringFilter
        }
      : {};

  /*
    Creates a category filter if a specific category is selected.
    - If `category` is "all" or empty, no filtering is applied.
  */
  const categoryFilter = category && category !== "all" ? { category } : {};

  /*
    Creates a price range filter.
    - Extracts min and max values from the `price` string ("min-max").
    - Uses `gte` (greater than or equal) and `lte` (less than or equal) to filter products within the range.
    - If `price` is "all" or empty, no filtering is applied.
  */
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]), // Minimum price
            lte: Number(price.split("-")[1]) // Maximum price
          }
        }
      : {};

  /*
    Creates a rating filter.
    - Filters products with a rating greater than or equal to the specified `rating`.
    - If `rating` is "all" or empty, no filtering is applied.
  */
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating) // Minimum rating
          }
        }
      : {};

  /*
    Retrieves products from the database with applied filters and sorting.
    - `where`: Combines all active filters (`queryFilter`, `categoryFilter`, `priceFilter`, `ratingFilter`).
    - `orderBy`: Sorts products based on the selected sorting option:
      - `"lowest"`: Sorts by price in ascending order.
      - `"highest"`: Sorts by price in descending order.
      - `"rating"`: Sorts by rating in descending order.
      - Default: Sorts by creation date in descending order (latest products first).
    - `skip`: Skips products based on the current page (pagination logic).
    - `take`: Limits the number of products per page.
  */
  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter
    },
    orderBy: sort === "lowest" ? { price: "asc" } : sort === "highest" ? { price: "desc" } : sort === "rating" ? { rating: "desc" } : { createdAt: "desc" }, // Default sorting by newest products
    skip: (page - 1) * limit, // Calculates offset for pagination
    take: limit // Limits the number of results per page
  });

  /*
    Retrieves the total number of products (ignoring filters) for pagination calculations.
  */
  const dataCount = await prisma.product.count();

  /*
    Returns the product data along with the total number of pages.
    - `data`: The list of filtered products.
    - `totalPages`: The total number of pages based on the product count.
  */
  return {
    data,
    totalPages: Math.ceil(dataCount / limit) // Calculates total pages for pagination
  };
}

/*
  Deletes a product from the database based on its unique identifier.

  Parameters:
  - `id`: The unique identifier of the product to be deleted.

  Returns:
  - An object with `success: true` if the product is deleted successfully.
  - An object with `success: false` and an error message if the deletion fails.
*/
export async function deleteProduct(id: string) {
  try {
    /*
      Checks if the product exists in the database before attempting to delete it.
      - `prisma.product.findFirst({ where: { id } })`: Searches for a product with the given `id`.
    */
    const productExists = await prisma.product.findFirst({
      where: { id }
    });

    /*
      If no product is found, an error is thrown to indicate that the deletion cannot proceed.
    */
    if (!productExists) throw new Error("Product not found");

    /*
      Deletes the product from the database.
      - `prisma.product.delete({ where: { id } })`: Deletes the product with the specified `id`.
    */
    await prisma.product.delete({ where: { id } });

    /*
      Revalidates the product list page to ensure the UI updates and no longer displays the deleted product.
      - `/admin/products`: The admin page where products are listed.
    */
    revalidatePath("/admin/products");

    /*
      Returns a success response after deleting the product.
      - `success: true`: Indicates that the operation was successful.
      - `message: "Product deleted successfully"`: Confirmation message for the deletion.
    */
    return {
      success: true,
      message: "Product deleted successfully"
    };
  } catch (error) {
    /*
      Catches any error that occurs during the deletion process.
      - Returns a failure response with the error message formatted using `formatError`.
    */
    return { success: false, message: formatError(error) };
  }
}

/*
  Creates a new product in the database after validating the input data.

  Parameters:
  - `data`: The product data to be validated and inserted into the database.
    - The structure of `data` is inferred from `insertProductSchema` using Zod.

  Returns:
  - An object with `success: true` if the product is created successfully.
  - An object with `success: false` and an error message if validation or insertion fails.
*/
export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    /*
      Validates the incoming product data using Zod.
      - `insertProductSchema.parse(data)`: Ensures that the provided data matches the expected schema.
      - If validation fails, an error is thrown, stopping execution.
    */
    const product = insertProductSchema.parse(data);

    /*
      Inserts the validated product data into the database.
      - `prisma.product.create({ data: product })`: Creates a new product entry in the database.
    */
    await prisma.product.create({ data: product });

    /*
      Revalidates the product list page to ensure the UI updates with the newly created product.
      - `/admin/products`: The admin page where products are listed.
    */
    revalidatePath("/admin/products");

    /*
      Returns a success response after creating the product.
      - `success: true`: Indicates that the operation was successful.
      - `message: "Product created successfully"`: Confirmation message for the creation.
    */
    return {
      success: true,
      message: "Product created successfully"
    };
  } catch (error) {
    /*
      Catches any error that occurs during validation or database insertion.
      - Returns a failure response with the error message formatted using `formatError`.
    */
    return { success: false, message: formatError(error) };
  }
}

/*
  Updates an existing product in the database after validating the input data.

  Parameters:
  - `data`: The product data to be validated and updated in the database.
    - The structure of `data` is inferred from `updateProductSchema` using Zod.

  Returns:
  - An object with `success: true` if the product is updated successfully.
  - An object with `success: false` and an error message if validation or updating fails.
*/
export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    /*
      Validates the incoming product data using Zod.
      - `updateProductSchema.parse(data)`: Ensures that the provided data matches the expected schema.
      - If validation fails, an error is thrown, stopping execution.
    */
    const product = updateProductSchema.parse(data);

    /*
      Checks if the product exists in the database before attempting to update it.
      - `prisma.product.findFirst({ where: { id: product.id } })`: Looks up the product by its unique ID.
      - If no product is found, an error is thrown.
    */
    const productExists = await prisma.product.findFirst({
      where: { id: product.id }
    });

    if (!productExists) throw new Error("Product not found");

    /*
      Updates the existing product in the database with the validated data.
      - `prisma.product.update({ where: { id: product.id }, data: product })`: Updates the product entry.
    */
    await prisma.product.update({ where: { id: product.id }, data: product });

    /*
      Revalidates the product list page to ensure the UI reflects the updated product information.
      - `/admin/products`: The admin page where products are listed.
    */
    revalidatePath("/admin/products");

    /*
      Returns a success response after updating the product.
      - `success: true`: Indicates that the operation was successful.
      - `message: "Product updated successfully"`: Confirmation message for the update.
    */
    return {
      success: true,
      message: "Product updated successfully"
    };
  } catch (error) {
    /*
      Catches any error that occurs during validation or database updating.
      - Returns a failure response with the error message formatted using `formatError`.
    */
    return { success: false, message: formatError(error) };
  }
}

/*
  Retrieves a single product from the database using its unique identifier.

  Parameters:
  - `productId`: A string representing the unique identifier of the product.

  Returns:
  - A plain JavaScript object representing the product if found.
  - `null` if no product matches the provided `productId`.
*/
export async function getProductById(productId: string) {
  /*
    Queries the database to find the first product that matches the given `productId`.
    - `prisma.product.findFirst()`: Searches for a product in the `product` table.
    - `where: { id: productId }`: Filters the query to find a product with the specified `id`.
    - Returns `null` if no product is found.
  */
  const data = await prisma.product.findFirst({
    where: { id: productId }
  });

  /*
    Converts the retrieved product data into a plain JavaScript object.
    - Ensures the returned object is free from Prisma-specific structures.
    - This helps with serialization and prevents potential issues when passing data to the frontend.
  */
  return convertToPlainObject(data);
}

/*
  Fetches all unique product categories from the database along with their count.

  Parameters:
  - None

  Returns:
  - An array of objects, where each object contains:
    - `category`: The unique category name.
    - `_count`: The number of products in that category.
*/
export async function getAllCategories() {
  /*
    Queries the database to group products by their category.
    - `by: ['category']`: Groups the products based on the `category` field.
    - `_count: true`: Counts the number of products in each category.
    
    The result will be an array of objects, each containing:
    - `category`: The name of the category.
    - `_count`: The number of products that belong to this category.
  */
  const data = await prisma.product.groupBy({
    by: ["category"], // Groups products by the `category` field.
    _count: true // Counts the number of products in each category.
  });

  /*
    Returns the grouped category data.
    - Example output: [{ category: "Electronics", _count: 5 }, { category: "Clothing", _count: 8 }]
  */
  return data;
}

/*
  Fetches featured products from the database.

  Returns:
  - An array of up to 4 featured product objects, ordered by creation date.
*/
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true }, // Filters the products to include only those marked as featured.
    orderBy: { createdAt: "desc" }, // Orders the products by creation date in descending order (newest first).
    take: 4 // Limits the number of products retrieved to 4.
  });

  return convertToPlainObject(data); // Converts the retrieved data into plain JavaScript objects for better handling.
}
