"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { formatError } from "../utils";
import { insertReviewSchema } from "../validator";
import { prisma } from "@/db/prisma";

/*
  Creates or updates a product review in the database.

  Parameters:
  - `data`: An object inferred from `insertReviewSchema`, containing review details with:
    - `title`: The title of the review.
    - `description`: The review content.
    - `productId`: The ID of the product being reviewed.
    - `userId`: The ID of the user submitting the review.
    - `rating`: The numeric rating (1-5).

  Returns:
  - An object with `success: true` if the review is created/updated successfully.
  - An object with `success: false` and an error message if the operation fails.
*/
export async function createUpdateReview(data: z.infer<typeof insertReviewSchema>) {
  try {
    /*
      Retrieves the current user session.
      - If no session exists, the user is not authenticated.
    */
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    /*
      Parses and validates the provided review data using Zod schema.
      - Spreads the `data` object to include provided values.
      - Overwrites `userId` with the authenticated user's ID from the session.
    */
    const review = insertReviewSchema.parse({
      ...data,
      userId: session?.user.id
    });

    /*
      Retrieves the product being reviewed from the database.
      - Searches for a product with an `id` matching `review.productId`.
    */
    const product = await prisma.product.findFirst({
      where: { id: review.productId }
    });

    // If no product is found, throw an error.
    if (!product) throw new Error("Product not found");

    /*
      Checks if the user has already submitted a review for this product.
      - Searches for an existing review with matching `productId` and `userId`.
    */
    const reviewExists = await prisma.review.findFirst({
      where: {
        productId: review.productId,
        userId: review.userId
      }
    });

    /*
      Uses a Prisma transaction to ensure atomicity.
      - If a review exists, update it.
      - Otherwise, create a new review.
    */
    await prisma.$transaction(async tx => {
      if (reviewExists) {
        /*
          Updates the existing review in the database.
          - Finds the review by its `id` and updates its fields.
        */
        await tx.review.update({
          where: { id: reviewExists.id },
          data: {
            description: review.description, // Update review description.
            title: review.title, // Update review title.
            rating: review.rating // Update review rating.
          }
        });
      } else {
        /*
          Creates a new review in the database.
          - Uses the validated `review` object.
        */
        await tx.review.create({ data: review });
      }

      /*
        Calculates the average rating for the product.
        - Aggregates all reviews for the product and computes the average `rating`.
      */
      const averageRating = await tx.review.aggregate({
        _avg: { rating: true },
        where: { productId: review.productId }
      });

      /*
        Retrieves the total number of reviews for the product.
      */
      const numReviews = await tx.review.count({
        where: { productId: review.productId }
      });

      /*
        Updates the product's rating and review count.
        - Sets `rating` to the computed average rating (or 0 if no reviews exist).
        - Sets `numReviews` to the total count of reviews.
      */
      await tx.product.update({
        where: { id: review.productId },
        data: {
          rating: averageRating._avg.rating || 0,
          numReviews: numReviews
        }
      });
    });

    /*
      Revalidates the product page cache to ensure the latest review data is reflected.
      - Uses the product's slug to update the correct page.
    */
    revalidatePath(`/product/${product.slug}`);

    /*
      Returns a success response after creating or updating the review.
      - `success: true`: Indicates operation success.
      - `message: "Review updated successfully"`: Confirmation message.
    */
    return {
      success: true,
      message: "Review updated successfully"
    };
  } catch (error) {
    /*
      Catches and handles any errors that occur during the process.
      - Returns a failure response with a formatted error message.
    */
    return {
      success: false,
      message: formatError(error)
    };
  }
}

/*
  Retrieves all reviews for a specific product.

  Parameters:
  - `productId`: A string representing the unique identifier of the product.

  Returns:
  - An object containing a `data` array with all reviews related to the given product.
    Each review includes:
    - `user`: An object containing the reviewer's name.
    - `createdAt`: Timestamp for sorting reviews in descending order.
*/
export async function getReviews({ productId }: { productId: string }) {
  /*
    Fetches all reviews from the database where:
    - `productId` matches the given product ID.
    - Includes the `user` object with only the `name` field.
    - Orders the results by `createdAt` in descending order (newest first).
  */
  const data = await prisma.review.findMany({
    where: {
      productId: productId // Filters reviews by the specified product ID
    },
    include: {
      user: {
        select: {
          name: true // Retrieves only the user's name for each review
        }
      }
    },
    orderBy: {
      createdAt: "desc" // Orders reviews from newest to oldest
    }
  });

  /*
    Returns the retrieved review data as an object.
    - `data`: Contains the list of reviews matching the product ID.
  */
  return { data };
}

/*
  Retrieves a review for a specific product written by the currently authenticated user.

  Parameters:
  - `productId`: A string representing the unique identifier of the product.

  Returns:
  - The first review found that matches the given product ID and the authenticated user's ID.
  - Throws an error if the user is not authenticated.
*/
export const getReviewByProductId = async ({ productId }: { productId: string }) => {
  /*
    Retrieves the current user's authentication session.
    - If no session exists, the user is not authenticated, so an error is thrown.
  */
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  /*
    Queries the database for a review where:
    - `productId` matches the given product ID.
    - `userId` matches the authenticated user's ID.
    - `findFirst()` is used to return the first matching review.
  */
  return await prisma.review.findFirst({
    where: { productId, userId: session?.user.id }
  });
};
