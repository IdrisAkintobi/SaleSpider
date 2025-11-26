-- CreateTable: AppSettings
-- Manages application-wide configuration and preferences

CREATE TABLE "public"."AppSettings" (
    "id" TEXT NOT NULL,
    "appName" TEXT NOT NULL DEFAULT 'SaleSpider',
    "appLogo" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#0f172a',
    "secondaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "currencySymbol" TEXT NOT NULL DEFAULT '₦',
    "vatPercentage" DOUBLE PRECISION NOT NULL DEFAULT 7.5,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
    "dateFormat" TEXT NOT NULL DEFAULT 'dd/MM/yyyy',
    "timeFormat" TEXT NOT NULL DEFAULT 'HH:mm',
    "language" TEXT NOT NULL DEFAULT 'en',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "showDeletedProducts" BOOLEAN NOT NULL DEFAULT false,
    "enabledPaymentMethods" "public"."PaymentMode"[] DEFAULT ARRAY['CASH', 'CARD', 'BANK_TRANSFER', 'CRYPTO', 'OTHER']::"public"."PaymentMode"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
