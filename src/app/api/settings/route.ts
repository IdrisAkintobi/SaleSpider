import { handleException, jsonError, jsonOk } from "@/lib/api-response";
import { authenticateUser, isSuperAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS, PAYMENT_METHODS } from "@/lib/constants";
import { createChildLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const logger = createChildLogger("api:settings");

// Helper: build default settings payload (used in GET and PATCH)
function buildDefaultSettingsData() {
  return {
    appName: process.env.APP_NAME || DEFAULT_SETTINGS.appName,
    appLogo: process.env.APP_LOGO || DEFAULT_SETTINGS.appLogo,
    primaryColor: process.env.PRIMARY_COLOR || DEFAULT_SETTINGS.primaryColor,
    secondaryColor:
      process.env.SECONDARY_COLOR || DEFAULT_SETTINGS.secondaryColor,
    accentColor: process.env.ACCENT_COLOR || DEFAULT_SETTINGS.accentColor,
    currency: process.env.CURRENCY || DEFAULT_SETTINGS.currency,
    currencySymbol:
      process.env.CURRENCY_SYMBOL || DEFAULT_SETTINGS.currencySymbol,
    vatPercentage: Number.parseFloat(
      process.env.VAT_PERCENTAGE || DEFAULT_SETTINGS.vatPercentage.toString()
    ),
    timezone: process.env.TIMEZONE || DEFAULT_SETTINGS.timezone,
    dateFormat: process.env.DATE_FORMAT || DEFAULT_SETTINGS.dateFormat,
    timeFormat: process.env.TIME_FORMAT || DEFAULT_SETTINGS.timeFormat,
    language: process.env.LANGUAGE || DEFAULT_SETTINGS.language,
    theme: process.env.THEME || DEFAULT_SETTINGS.theme,
    maintenanceMode:
      process.env.MAINTENANCE_MODE === "true" ||
      DEFAULT_SETTINGS.maintenanceMode,
    showDeletedProducts:
      process.env.SHOW_DELETED_PRODUCTS === "true" ||
      DEFAULT_SETTINGS.showDeletedProducts,
    enabledPaymentMethods: process.env.ENABLED_PAYMENT_METHODS
      ? process.env.ENABLED_PAYMENT_METHODS.split(",").map(s =>
          s.trim().toUpperCase()
        )
      : [...(DEFAULT_SETTINGS.enabledPaymentMethods as readonly string[])],
  } as any;
}

// GET /api/settings
// Public endpoint - settings needed for login page (app name, logo, theme, etc.)
export async function GET() {
  try {
    logger.debug("GET /api/settings start");

    // Get settings from database
    let settings = await prisma.appSettings.findFirst();

    // If no settings exist, create default settings
    settings ??= await (async () => {
      logger.warn("No settings found, creating defaults");
      return prisma.appSettings.create({
        data: buildDefaultSettingsData(),
      });
    })();

    logger.debug({ settingsId: settings.id }, "GET /api/settings success");
    return jsonOk(settings);
  } catch (error) {
    return handleException(error, "Failed to fetch settings", 500);
  }
}

// Helper: validate payment methods
function validatePaymentMethods(
  enabledPaymentMethods: unknown,
  userId: string
): string[] | NextResponse {
  const allowed = new Set<string>(PAYMENT_METHODS.map(m => m.enum));
  const incoming = Array.isArray(enabledPaymentMethods)
    ? enabledPaymentMethods
    : [];
  const normalized = incoming
    .filter((v): v is string => typeof v === "string")
    .map(v => v.trim().toUpperCase());
  const invalid = normalized.filter(v => !allowed.has(v));

  if (invalid.length > 0) {
    logger.warn(
      { userId, invalid, normalized },
      "Invalid payment methods submitted"
    );
    return jsonError(`Invalid payment methods: ${invalid.join(", ")}`, 400, {
      code: "BAD_REQUEST",
    });
  }

  logger.debug(
    { userId, paymentMethods: normalized },
    "Payment methods validated"
  );
  return normalized;
}

// Helper: get or create settings
async function getOrCreateSettings() {
  let settings = await prisma.appSettings.findFirst();
  settings ??= await prisma.appSettings.create({
    data: buildDefaultSettingsData(),
  });
  return settings;
}

// Helper: build update data
function buildUpdateData(body: any, validatedPaymentMethods?: string[]) {
  const fields = [
    "appName",
    "appLogo",
    "primaryColor",
    "secondaryColor",
    "accentColor",
    "currency",
    "currencySymbol",
    "vatPercentage",
    "timezone",
    "dateFormat",
    "timeFormat",
    "language",
    "theme",
    "maintenanceMode",
    "showDeletedProducts",
  ];

  const updateData: Record<string, any> = {};

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  if (validatedPaymentMethods !== undefined) {
    updateData.enabledPaymentMethods = validatedPaymentMethods;
  }

  return updateData;
}

// PATCH /api/settings
export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateUser(request);

    if (!user) {
      return jsonError("Unauthorized", 401, { code: "UNAUTHORIZED" });
    }

    if (!isSuperAdmin(user)) {
      return jsonError("Forbidden", 403, { code: "FORBIDDEN" });
    }

    const body = await request.json();
    logger.info(
      { userId: user.id, keys: Object.keys(body) },
      "PATCH /api/settings payload received"
    );

    // Validate payment methods if provided
    let validatedPaymentMethods: string[] | undefined;
    if (body.enabledPaymentMethods !== undefined) {
      const result = validatePaymentMethods(
        body.enabledPaymentMethods,
        user.id
      );
      if (result instanceof NextResponse) {
        return result;
      }
      validatedPaymentMethods = result;
    }

    // Get or create settings
    const settings = await getOrCreateSettings();

    // Update settings
    const updatedSettings = await prisma.appSettings.update({
      where: { id: settings.id },
      data: buildUpdateData(body, validatedPaymentMethods),
    });

    logger.info(
      { userId: user.id, settingsId: updatedSettings.id },
      "PATCH /api/settings success"
    );
    return jsonOk(updatedSettings);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : "Unknown error" },
      "Failed to update settings"
    );
    return handleException(error, "Failed to update settings", 500);
  }
}
