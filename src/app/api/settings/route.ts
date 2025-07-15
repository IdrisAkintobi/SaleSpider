import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/lib/constants";

// GET /api/settings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (!isSuperAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get settings from database
    let settings = await prisma.appSettings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
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
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH /api/settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super admin
    if (!isSuperAdmin(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      appName,
      appLogo,
      primaryColor,
      secondaryColor,
      accentColor,
      currency,
      currencySymbol,
      vatPercentage,
      timezone,
      dateFormat,
      timeFormat,
      language,
      theme,
      maintenanceMode,
    } = body;

    // Get current settings
    let settings = await prisma.appSettings.findFirst();

    // If no settings exist, create with defaults
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
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
        },
      });
    }

    // Update settings with provided values
    const updatedSettings = await prisma.appSettings.update({
      where: { id: settings.id },
      data: {
        ...(appName !== undefined && { appName }),
        ...(appLogo !== undefined && { appLogo }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(currency !== undefined && { currency }),
        ...(currencySymbol !== undefined && { currencySymbol }),
        ...(vatPercentage !== undefined && { vatPercentage }),
        ...(timezone !== undefined && { timezone }),
        ...(dateFormat !== undefined && { dateFormat }),
        ...(timeFormat !== undefined && { timeFormat }),
        ...(language !== undefined && { language }),
        ...(theme !== undefined && { theme }),
        ...(maintenanceMode !== undefined && { maintenanceMode }),
      },
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
} 