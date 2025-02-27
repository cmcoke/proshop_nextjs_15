"use server";

import { prisma } from "@/db/prisma"; // Imports the prisma client instance for database operations.
import { convertToPlainObject } from "../utils"; // Imports the convertToPlainObject utility function.
import { LATEST_PRODUCTS_LIMIT } from "../constants"; // Imports the constant for the latest products limit.

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
