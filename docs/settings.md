# Application Settings

The SaleSpider application includes a comprehensive settings system that allows Super Administrators to configure various aspects of the application through both environment variables and the admin interface.

## Settings Overview

### Access Control
- **Only Super Administrators** can access the settings page
- Settings are persisted in the database
- Environment variables provide default values
- Changes take effect immediately

## Available Settings

### General Settings
- **Application Name**: The name displayed throughout the application
- **Logo URL**: URL to the application logo
- **VAT Percentage**: Default VAT rate for sales calculations

### Appearance Settings
- **Primary Color**: Main brand color (#0f172a)
- **Secondary Color**: Secondary brand color (#3b82f6)
- **Accent Color**: Accent/highlight color (#f59e0b)
- **Theme**: Light, Dark, or Auto (system preference)

### Currency Settings
- **Currency**: Currency code (NGN, USD, EUR, etc.)
- **Currency Symbol**: Currency symbol (₦, $, €, etc.)

### Localization Settings
- **Language**: Application language (en, es, fr, etc.)
- **Timezone**: Application timezone (Africa/Lagos, etc.)
- **Date Format**: Date display format (dd/MM/yyyy, etc.)
- **Time Format**: Time display format (HH:mm, etc.)

### System Settings
- **Maintenance Mode**: Enable/disable application access

## Environment Variables

You can set default values using environment variables:

```bash
# Application Settings
APP_NAME="SaleSpider"
APP_LOGO="https://example.com/logo.png"

# Color Scheme
PRIMARY_COLOR="#0f172a"
SECONDARY_COLOR="#3b82f6"
ACCENT_COLOR="#f59e0b"

# Currency Settings
CURRENCY="NGN"
CURRENCY_SYMBOL="₦"
VAT_PERCENTAGE="7.5"

# Localization
TIMEZONE="Africa/Lagos"
DATE_FORMAT="dd/MM/yyyy"
TIME_FORMAT="HH:mm"
LANGUAGE="en"
THEME="light"

# System Settings
MAINTENANCE_MODE="false"
```

## Public Environment Variables

For client-side access, use `NEXT_PUBLIC_` prefix:

```bash
NEXT_PUBLIC_APP_NAME="SaleSpider"
NEXT_PUBLIC_CURRENCY="NGN"
NEXT_PUBLIC_VAT_PERCENTAGE="7.5"
# ... etc
```

## Database Schema

Settings are stored in the `AppSettings` table:

```sql
CREATE TABLE "AppSettings" (
  "id" TEXT NOT NULL,
  "appName" TEXT NOT NULL DEFAULT 'SaleSpider',
  "appLogo" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#0f172a',
  "secondaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
  "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "currencySymbol" TEXT NOT NULL DEFAULT '₦',
  "vatPercentage" REAL NOT NULL DEFAULT 7.5,
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Lagos',
  "dateFormat" TEXT NOT NULL DEFAULT 'dd/MM/yyyy',
  "timeFormat" TEXT NOT NULL DEFAULT 'HH:mm',
  "language" TEXT NOT NULL DEFAULT 'en',
  "theme" TEXT NOT NULL DEFAULT 'light',
  "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  PRIMARY KEY ("id")
);
```

## API Endpoints

### GET /api/settings
- **Access**: Super Admin only
- **Purpose**: Retrieve current application settings
- **Response**: AppSettings object

### PATCH /api/settings
- **Access**: Super Admin only
- **Purpose**: Update application settings
- **Body**: Partial AppSettings object
- **Response**: Updated AppSettings object

## Usage in Components

```tsx
import { useSettingsContext } from "@/contexts/settings-context";

function MyComponent() {
  const { settings } = useSettingsContext();
  
  return (
    <div>
      <h1>{settings.appName}</h1>
      <p>Currency: {settings.currencySymbol}</p>
    </div>
  );
}
```

## Default Values

If no settings exist in the database, the system will:

1. Check for environment variables
2. Use hardcoded defaults if no environment variables are set
3. Create a default settings record in the database

## Migration and Seeding

To set up the settings system:

1. Run the database migration:
   ```bash
   npx prisma migrate dev --name add_app_settings
   ```

2. Seed default settings:
   ```bash
   npx prisma db seed
   ```

## Security Considerations

- Only Super Administrators can access settings
- Settings are validated on both client and server
- Environment variables provide secure defaults
- Database changes are logged and auditable

## Troubleshooting

### Settings Not Loading
- Check if the user has Super Admin role
- Verify database connection
- Check for environment variable conflicts

### Changes Not Taking Effect
- Clear browser cache
- Restart the application
- Check for validation errors

### Database Errors
- Ensure migration has been run
- Check Prisma client is regenerated
- Verify database permissions 