import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

/**
 * Production seed - Only seeds essential data using raw SQL
 * - Super Admin user
 * - Default application settings
 * 
 * Required Environment Variables:
 * - SUPER_ADMIN_EMAIL: Email for super admin account
 * - SUPER_ADMIN_PASSWORD: Password for super admin account
 * 
 * Optional Environment Variables (with defaults):
 * - APP_NAME: Application name (default: "SaleSpider")
 * - APP_LOGO: Application logo URL (default: "")
 * - PRIMARY_COLOR: Primary theme color (default: "#0f172a")
 * - SECONDARY_COLOR: Secondary theme color (default: "#3b82f6")
 * - ACCENT_COLOR: Accent theme color (default: "#f59e0b")
 * - CURRENCY: Currency code (default: "NGN")
 * - CURRENCY_SYMBOL: Currency symbol (default: "₦")
 * - VAT_PERCENTAGE: VAT percentage (default: "7.5")
 * - TIMEZONE: Application timezone (default: "Africa/Lagos")
 * - DATE_FORMAT: Date format (default: "dd/MM/yyyy")
 * - TIME_FORMAT: Time format (default: "HH:mm")
 * - LANGUAGE: Application language (default: "en")
 * - THEME: Application theme (default: "light")
 * - MAINTENANCE_MODE: Enable maintenance mode (default: false)
 * - SHOW_DELETED_PRODUCTS: Show deleted products (default: false)
 * - ENABLED_PAYMENT_METHODS: Comma-separated payment methods (default: "CASH,CARD,BANK_TRANSFER,CRYPTO,OTHER")
 */

const prisma = new PrismaClient();

async function seedProduction() {
  console.log("🌱 Starting production seeding...");

  try {
    // 1. Seed Super Admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
      throw new Error("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD environment variables are required");
    }

    // Check if super admin exists
    const existingAdmin = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "User" WHERE email = ${superAdminEmail} LIMIT 1
    `;

    if (existingAdmin.length === 0) {
      // Hash password
      const hashedPassword = await argon2.hash(superAdminPassword);

      // Create super admin using raw SQL
      await prisma.$executeRaw`
        INSERT INTO "User" (id, username, name, email, password, role, "createdAt", "updatedAt")
        VALUES (
          'super_admin',
          'super_admin',
          'Super Admin',
          ${superAdminEmail},
          ${hashedPassword},
          'SUPER_ADMIN',
          NOW(),
          NOW()
        )
      `;
      console.log(`✅ Super admin created: ${superAdminEmail}`);
    } else {
      console.log(`✅ Super admin already exists: ${superAdminEmail}`);
    }

    // 2. Seed Default Settings
    const existingSettings = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "AppSettings" LIMIT 1
    `;

    if (existingSettings.length === 0) {
      // Get settings from environment variables with defaults
      const appName = process.env.APP_NAME || "SaleSpider";
      const appLogo = process.env.APP_LOGO || "";
      const primaryColor = process.env.PRIMARY_COLOR || "#0f172a";
      const secondaryColor = process.env.SECONDARY_COLOR || "#3b82f6";
      const accentColor = process.env.ACCENT_COLOR || "#f59e0b";
      const currency = process.env.CURRENCY || "NGN";
      const currencySymbol = process.env.CURRENCY_SYMBOL || "₦";
      const vatPercentage = parseFloat(process.env.VAT_PERCENTAGE || "7.5");
      const timezone = process.env.TIMEZONE || "Africa/Lagos";
      const dateFormat = process.env.DATE_FORMAT || "dd/MM/yyyy";
      const timeFormat = process.env.TIME_FORMAT || "HH:mm";
      const language = process.env.LANGUAGE || "en";
      const theme = process.env.THEME || "light";
      const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
      const showDeletedProducts = process.env.SHOW_DELETED_PRODUCTS === "true";
      
      // Parse enabled payment methods from env or use defaults
      const enabledPaymentMethods = process.env.ENABLED_PAYMENT_METHODS
        ? process.env.ENABLED_PAYMENT_METHODS.split(",").map(s => s.trim().toUpperCase())
        : ["CASH", "CARD", "BANK_TRANSFER", "CRYPTO", "OTHER"];

      await prisma.$executeRaw`
        INSERT INTO "AppSettings" (
          id,
          "appName",
          "appLogo",
          "primaryColor",
          "secondaryColor",
          "accentColor",
          currency,
          "currencySymbol",
          "vatPercentage",
          timezone,
          "dateFormat",
          "timeFormat",
          language,
          theme,
          "maintenanceMode",
          "showDeletedProducts",
          "enabledPaymentMethods",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          gen_random_uuid(),
          ${appName},
          ${appLogo},
          ${primaryColor},
          ${secondaryColor},
          ${accentColor},
          ${currency},
          ${currencySymbol},
          ${vatPercentage},
          ${timezone},
          ${dateFormat},
          ${timeFormat},
          ${language},
          ${theme},
          ${maintenanceMode},
          ${showDeletedProducts},
          ${enabledPaymentMethods}::"PaymentMode"[],
          NOW(),
          NOW()
        )
      `;
      console.log(`✅ Default settings created (App: ${appName}, Currency: ${currency})`);
    } else {
      console.log("✅ Settings already exist");
    }

    console.log("🎉 Production seeding completed successfully!");
  } catch (error) {
    console.error("❌ Production seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedProduction()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
