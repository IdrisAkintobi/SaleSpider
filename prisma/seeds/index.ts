import { prisma } from "@/lib/prisma";
import { seedProducts } from "./seed-product.ts";
import { seedSales } from "./seed-sales.ts";
import { seedStaff } from "./seed-staff.ts";
import { seedSuperAdmin } from "./seed-super-admin.ts";
import { seedSettings } from "./seed-settings.ts";

async function main() {
  console.log("🚀 Starting development database seeding...");
  console.log("⚠️  This will create a large amount of test data for development purposes.\n");

  const startTime = Date.now();

  try {
    // Step 1: Super Admin
    console.log("👨‍💼 1/5 Creating Super Admin...");
    await seedSuperAdmin(prisma);

    // Step 2: Staff users
    console.log("\n👥 2/5 Creating Staff Users...");
    await seedStaff(prisma);

    // Step 3: App Settings
    console.log("\n⚙️ 3/5 Creating App Settings...");
    await seedSettings();

    // Step 4: Enhanced Products (1600 items)
    console.log("\n📦 4/5 Creating 1,600 Products...");
    console.log("This should take about a minute...");
    await seedProducts(prisma, 1600);

    // Step 5: Enhanced Sales (12,000 records)
    console.log("\n🛒 5/5 Creating 12,000 Sales Records...");
    console.log("This may take a few minutes...");
    await seedSales(prisma, 12000);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n🎉 Development database seeding completed successfully!");
    console.log(`⏱️  Total time: ${duration} seconds`);
    console.log("\n📋 Summary:");
    console.log("  ✅ 1 Super Admin user");
    console.log("  ✅ Multiple Staff users (cashiers, managers)");
    console.log("  ✅ Application settings configured");
    console.log("  ✅ 1,600 realistic products across all categories");
    console.log("  ✅ 12,000 sales records spanning 3 months");
    console.log("\n🔗 You can now:");
    console.log("  • Start the development server: npm run dev");
    console.log("  • Login with super admin credentials");
    console.log("  • Explore the dashboard with realistic data");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n⚠️  Seeding interrupted by user");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n⚠️  Seeding terminated");
  await prisma.$disconnect();
  process.exit(0);
});

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
