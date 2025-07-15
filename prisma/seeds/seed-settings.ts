import { PrismaClient } from "@prisma/client";
import { DEFAULT_SETTINGS } from "../../src/lib/constants";

const prisma = new PrismaClient();

const defaultSettings = {
  appName: process.env.APP_NAME || DEFAULT_SETTINGS.appName,
  appLogo: process.env.APP_LOGO || DEFAULT_SETTINGS.appLogo,
  primaryColor: process.env.PRIMARY_COLOR || DEFAULT_SETTINGS.primaryColor,
  secondaryColor: process.env.SECONDARY_COLOR || DEFAULT_SETTINGS.secondaryColor,
  accentColor: process.env.ACCENT_COLOR || DEFAULT_SETTINGS.accentColor,
  currency: process.env.CURRENCY || DEFAULT_SETTINGS.currency,
  currencySymbol: process.env.CURRENCY_SYMBOL || DEFAULT_SETTINGS.currencySymbol,
  vatPercentage: parseFloat(process.env.VAT_PERCENTAGE || DEFAULT_SETTINGS.vatPercentage.toString()),
  timezone: process.env.TIMEZONE || DEFAULT_SETTINGS.timezone,
  dateFormat: process.env.DATE_FORMAT || DEFAULT_SETTINGS.dateFormat,
  timeFormat: process.env.TIME_FORMAT || DEFAULT_SETTINGS.timeFormat,
  language: process.env.LANGUAGE || DEFAULT_SETTINGS.language,
  theme: process.env.THEME || DEFAULT_SETTINGS.theme,
  maintenanceMode: process.env.MAINTENANCE_MODE === "true" || DEFAULT_SETTINGS.maintenanceMode,
};

export async function seedSettings() {
  console.log("🌱 Seeding settings...");

  try {
    // Check if settings already exist
    const existingSettings = await prisma.appSettings.findFirst();
    
    if (existingSettings) {
      console.log("✅ Settings already exist, skipping...");
      return existingSettings;
    }

    // Create default settings
    const settings = await prisma.appSettings.create({
      data: {
        appName: defaultSettings.appName,
        appLogo: defaultSettings.appLogo,
        primaryColor: defaultSettings.primaryColor,
        secondaryColor: defaultSettings.secondaryColor,
        accentColor: defaultSettings.accentColor,
        currency: defaultSettings.currency,
        currencySymbol: defaultSettings.currencySymbol,
        vatPercentage: defaultSettings.vatPercentage,
        timezone: defaultSettings.timezone,
        dateFormat: defaultSettings.dateFormat,
        timeFormat: defaultSettings.timeFormat,
        language: defaultSettings.language,
        theme: defaultSettings.theme,
        maintenanceMode: defaultSettings.maintenanceMode,
      },
    });

    console.log("✅ Settings seeded successfully");
    return settings;
  } catch (error) {
    console.error("❌ Error seeding settings:", error);
    throw error;
  }
} 