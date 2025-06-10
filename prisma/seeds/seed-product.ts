import { PrismaClient } from "@prisma/client";
import { products } from "./data.ts";

export async function seedProducts(client: PrismaClient) {
  // Create products
  await client.product.createMany({
    data: products,
  });

  console.log(`${products.length} products created`);
}
