import { PrismaClient } from "@prisma/client";
import { seedProducts } from "./seed-product.ts";
import { seedSales } from "./seed-sales.ts";
import { seedStaff } from "./seed-staff.ts";
import { seedSuperAdmin } from "./seed-super-admin.ts";
import { seedSettings } from "./seed-settings.ts";

const prisma = new PrismaClient();

async function main() {
  await seedSuperAdmin(prisma);
  await seedStaff(prisma);
  await seedProducts(prisma);
  await seedSales(prisma);
  await seedSettings();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
