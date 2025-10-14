import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

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

const prisma = new PrismaClient()

/**
 * Check if error is a duplicate key constraint violation
 */
function isDuplicateKeyError(error: any): boolean {
  return error.code === 'P2010' && error.meta?.code === '23505'
}

/**
 * Seed super admin user
 */
async function seedSuperAdmin() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD environment variables are required'
    )
  }

  // Check if super admin exists
  const existingAdmin = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "User" WHERE email = ${superAdminEmail} LIMIT 1
  `

  if (existingAdmin.length > 0) {
    console.log(`✅ Super admin already exists: ${superAdminEmail}`)
    return
  }

  try {
    // Hash password
    const hashedPassword = await argon2.hash(superAdminPassword)

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
    `
    console.log(`✅ Super admin created: ${superAdminEmail}`)
  } catch (error: any) {
    if (isDuplicateKeyError(error)) {
      console.log(
        `✅ Super admin already exists (duplicate key): ${superAdminEmail}`
      )
    } else {
      console.warn(`⚠️ Warning: Could not create super admin: ${error.message}`)
    }
  }
}

/**
 * Get settings configuration from environment variables
 */
function getSettingsConfig() {
  return {
    appName: process.env.APP_NAME || 'SaleSpider',
    appLogo: process.env.APP_LOGO || '',
    primaryColor: process.env.PRIMARY_COLOR || '#0f172a',
    secondaryColor: process.env.SECONDARY_COLOR || '#3b82f6',
    accentColor: process.env.ACCENT_COLOR || '#f59e0b',
    currency: process.env.CURRENCY || 'NGN',
    currencySymbol: process.env.CURRENCY_SYMBOL || '₦',
    vatPercentage: Number.parseFloat(process.env.VAT_PERCENTAGE || '7.5'),
    timezone: process.env.TIMEZONE || 'Africa/Lagos',
    dateFormat: process.env.DATE_FORMAT || 'dd/MM/yyyy',
    timeFormat: process.env.TIME_FORMAT || 'HH:mm',
    language: process.env.LANGUAGE || 'en',
    theme: process.env.THEME || 'light',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
    showDeletedProducts: process.env.SHOW_DELETED_PRODUCTS === 'true',
    enabledPaymentMethods: process.env.ENABLED_PAYMENT_METHODS
      ? process.env.ENABLED_PAYMENT_METHODS.split(',').map(s =>
          s.trim().toUpperCase()
        )
      : ['CASH', 'CARD', 'BANK_TRANSFER', 'CRYPTO', 'OTHER'],
  }
}

/**
 * Seed default application settings
 */
async function seedDefaultSettings() {
  // Check if settings exist
  const existingSettings = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "AppSettings" LIMIT 1
  `

  if (existingSettings.length > 0) {
    console.log('✅ Settings already exist')
    return
  }

  try {
    const config = getSettingsConfig()

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
        ${config.appName},
        ${config.appLogo},
        ${config.primaryColor},
        ${config.secondaryColor},
        ${config.accentColor},
        ${config.currency},
        ${config.currencySymbol},
        ${config.vatPercentage},
        ${config.timezone},
        ${config.dateFormat},
        ${config.timeFormat},
        ${config.language},
        ${config.theme},
        ${config.maintenanceMode},
        ${config.showDeletedProducts},
        ${config.enabledPaymentMethods}::"PaymentMode"[],
        NOW(),
        NOW()
      )
    `
    console.log(
      `✅ Default settings created (App: ${config.appName}, Currency: ${config.currency})`
    )
  } catch (error: any) {
    if (isDuplicateKeyError(error)) {
      console.log('✅ Settings already exist (duplicate key)')
    } else {
      console.warn(`⚠️ Warning: Could not create settings: ${error.message}`)
    }
  }
}

/**
 * Main production seeding function
 */
async function seedProduction() {
  console.log('🌱 Starting production seeding...')

  try {
    await seedSuperAdmin()
    await seedDefaultSettings()
    console.log('🎉 Production seeding completed successfully!')
  } catch (error) {
    console.error('❌ Production seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed
seedProduction().catch(error => {
  console.error(error)
  process.exit(1)
})
