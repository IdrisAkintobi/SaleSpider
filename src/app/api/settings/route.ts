import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isSuperAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS, PAYMENT_METHODS } from "@/lib/constants";
import { createChildLogger } from "@/lib/logger";
import { jsonOk, jsonError, handleException } from "@/lib/api-response";

const logger = createChildLogger('api:settings');

// Helper: build default settings payload (used in GET and PATCH)
function buildDefaultSettingsData() {
  return ({
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
    showDeletedProducts: process.env.SHOW_DELETED_PRODUCTS === "true" || DEFAULT_SETTINGS.showDeletedProducts,
    enabledPaymentMethods: (process.env.ENABLED_PAYMENT_METHODS
      ? process.env.ENABLED_PAYMENT_METHODS.split(",").map(s => s.trim().toUpperCase())
      : [...(DEFAULT_SETTINGS.enabledPaymentMethods as readonly string[])]),
  }) as any;
}

// GET /api/settings
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
    }

    // Removed: Check if user is super admin
    // All authenticated users can fetch settings
    logger.debug({ userId: user.id }, 'GET /api/settings start');

    // Get settings from database
    let settings = await prisma.appSettings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      logger.warn({ userId: user.id }, 'No settings found, creating defaults');
      settings = await prisma.appSettings.create({ data: buildDefaultSettingsData() });
    }

    logger.debug({ userId: user.id, settingsId: settings.id }, 'GET /api/settings success');
    return jsonOk(settings);
  } catch (error) {
    return handleException(error, "Failed to fetch settings", 500);
  }
}

// PATCH /api/settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
    }

    // Check if user is super admin
    if (!isSuperAdmin(user)) {
      return jsonError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    const body = await request.json();
    logger.info({ userId: user.id, keys: Object.keys(body) }, 'PATCH /api/settings payload received');
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
      showDeletedProducts,
      enabledPaymentMethods,
    } = body;

    // Validate enabledPaymentMethods if provided
    let validatedPaymentMethods: string[] | undefined = undefined;
    if (enabledPaymentMethods !== undefined) {
      const allowed: Set<string> = new Set(PAYMENT_METHODS.map(m => m.enum));
      const incoming = Array.isArray(enabledPaymentMethods)
        ? enabledPaymentMethods
        : [];
      const normalized = incoming
        .filter((v): v is string => typeof v === 'string')
        .map(v => v.trim().toUpperCase());
      const invalid = normalized.filter(v => !allowed.has(v));
      if (invalid.length > 0) {
        logger.warn({ userId: user.id, invalid, normalized }, 'Invalid payment methods submitted');
        return jsonError(`Invalid payment methods: ${invalid.join(', ')}` , 400, { code: "BAD_REQUEST" });
      }
      logger.debug({ userId: user.id, paymentMethods: normalized }, 'Payment methods validated');
      validatedPaymentMethods = normalized;
    }

    // Get current settings
    let settings = await prisma.appSettings.findFirst();

    // If no settings exist, create with defaults
    if (!settings) {
      settings = await prisma.appSettings.create({ data: buildDefaultSettingsData() });
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
        ...(showDeletedProducts !== undefined && { showDeletedProducts }),
        ...(validatedPaymentMethods !== undefined && { enabledPaymentMethods: validatedPaymentMethods as any }),
      },
    });

    logger.info({ userId: user.id, settingsId: updatedSettings.id }, 'PATCH /api/settings success');
    return jsonOk(updatedSettings);
  } catch (error) {
    return handleException(error, 'Failed to update settings', 500);
  }
}
 