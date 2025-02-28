/**
 * This script seeds the database with sample data (from db/sample-data.ts file) using Prisma.
 * It first deletes all existing data across related tables (products, users, accounts, sessions, and verification tokens)
 * and then inserts new records based on the provided sample data.
 **/

import { PrismaClient } from "@prisma/client"; // Imports the PrismaClient from the Prisma client library.
import sampleData from "./sample-data"; // Imports the sample product and user data from a local file.

// Defines an asynchronous function 'main' to perform the database seeding process.
async function main() {
  const prisma = new PrismaClient(); // Creates a new instance of the PrismaClient to interact with the database.

  await prisma.product.deleteMany(); // Deletes all existing records in the 'product' table.
  await prisma.account.deleteMany(); // Deletes all existing records in the 'account' table.
  await prisma.session.deleteMany(); // Deletes all existing records in the 'session' table.
  await prisma.verificationToken.deleteMany(); // Deletes all existing records in the 'verificationToken' table.
  await prisma.user.deleteMany(); // Deletes all existing records in the 'user' table.

  await prisma.product.createMany({ data: sampleData.products }); // Inserts multiple product records from 'sampleData.products' into the 'product' table.
  await prisma.user.createMany({ data: sampleData.users }); // Inserts multiple user records from 'sampleData.users' into the 'user' table.

  console.log("Database seeded successfully"); // Logs a success message once the seeding process is complete.
}

main(); // Executes the 'main' function to start the seeding process.
