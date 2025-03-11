"use server";

import { prisma } from "@/db/prisma"; // Imports the prisma client instance for database operations.
import { convertToPlainObject, formatError } from "../utils"; // Imports the convertToPlainObject utility function.
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants"; // Imports the constant for the latest products limit.
import { revalidatePath } from "next/cache";
import { insertProductSchema, updateProductSchema } from "../validator";
import { z } from "zod";

/**
 * Get latest products
 * This function `getLatestProducts` fetches the latest products from the database.
 * It retrieves a limited number of products ordered by the creation date in descending order.
 **/
export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT, // Limits the number of products fetched to the specified constant.
    orderBy: { createdAt: "desc" } // Orders the products by creation date in descending order.
  });

  return convertToPlainObject(data); // Converts the fetched data to plain objects.
}

/**
 * Get single product by slug
 * This function `getProductBySlug` fetches a single product from the database based on the given slug.
 * @param slug - String representing the unique identifier of the product.
 **/
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug } // Finds the first product that matches the given slug.
  });
}

// Get all products
export async function getAllProducts({ limit = PAGE_SIZE, page }: { limit?: number; page: number }) {
  const data = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit)
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
