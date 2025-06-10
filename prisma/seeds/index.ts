import { PrismaClient } from "@prisma/client";
import { seedProducts } from "./seed-product.ts";
import { seedSuperAdmin } from "./seed-super-admin.ts";

const prisma = new PrismaClient();

async function main() {
  await seedSuperAdmin(prisma);
  await seedProducts(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
