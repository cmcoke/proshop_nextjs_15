/**
 * This script seeds the database with sample product data (from db/sample-data.ts file) using Prisma.
 * It first deletes all existing products and then creates new ones from the sample data.
 **/

import { PrismaClient } from "@prisma/client"; // Imports the PrismaClient from the Prisma client library.
import sampleData from "./sample-data"; // Imports the sample product data from a local file.

// Defines an asynchronous function 'main' to perform the database seeding.
async function main() {
  const prisma = new PrismaClient(); // Creates a new instance of the PrismaClient.
  await prisma.product.deleteMany(); // Deletes all records from the 'product' table.

  await prisma.product.createMany({ data: sampleData.products }); // Creates multiple product records using the data from 'sampleData.products'.

  console.log("Database seeded successfully"); // Logs a success message to the console.
}

main(); // Executes the 'main' function to start the seeding process.
