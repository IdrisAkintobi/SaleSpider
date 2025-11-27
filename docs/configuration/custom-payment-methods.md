# Adding Custom Payment Methods

This guide explains how to add custom payment methods to SaleSpider beyond the default options.

## Default Payment Methods

SaleSpider comes with these payment methods out of the box:

- **CASH** - Cash payments
- **CARD** - Card/credit card payments
- **BANK_TRANSFER** - Bank transfer payments
- **CRYPTO** - Cryptocurrency payments
- **OTHER** - Other payment methods

## Why Custom Payment Methods?

You might want to add custom payment methods for:

- Regional payment systems (e.g., M-Pesa, GCash, Paytm)
- Mobile money services
- Digital wallets
- Store credit systems
- Gift cards
- Custom payment integrations

## Steps to Add a Custom Payment Method

### 1. Update the Prisma Schema

Edit `prisma/schema.prisma` and add your new payment method to the `PaymentMode` enum:

```prisma
enum PaymentMode {
  CASH
  CARD
  BANK_TRANSFER
  CRYPTO
  OTHER
  MOBILE_MONEY    // Add your custom method here
  STORE_CREDIT    // You can add multiple
}
```

### 2. Update Constants File

Edit `src/lib/constants.ts` to include your new payment method:

```typescript
// Update PAYMENT_MODE_VALUES array
export const PAYMENT_MODE_VALUES = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "CRYPTO",
  "OTHER",
  "MOBILE_MONEY", // Add here
  "STORE_CREDIT", // Add here
] as const;

// Update PAYMENT_METHODS array with display labels
export const PAYMENT_METHODS = [
  { label: "Cash", enum: "CASH" as PaymentMode },
  { label: "Card", enum: "CARD" as PaymentMode },
  { label: "Bank Transfer", enum: "BANK_TRANSFER" as PaymentMode },
  { label: "Crypto", enum: "CRYPTO" as PaymentMode },
  { label: "Other", enum: "OTHER" as PaymentMode },
  { label: "Mobile Money", enum: "MOBILE_MONEY" as PaymentMode }, // Add here
  { label: "Store Credit", enum: "STORE_CREDIT" as PaymentMode }, // Add here
] as const;
```

### 3. Create and Run Migration

Generate a new Prisma migration to update the database:

```bash
npx prisma migrate dev --name add_custom_payment_methods
```

This will:

- Create a new migration file
- Update the database schema
- Regenerate the Prisma client

### 4. Update Environment Variables (Optional)

If you want the new payment methods enabled by default, update your `.env` file:

```bash
ENABLED_PAYMENT_METHODS=CASH,CARD,BANK_TRANSFER,CRYPTO,OTHER,MOBILE_MONEY,STORE_CREDIT
NEXT_PUBLIC_ENABLED_PAYMENT_METHODS=CASH,CARD,BANK_TRANSFER,CRYPTO,OTHER,MOBILE_MONEY,STORE_CREDIT
```

### 5. Rebuild and Restart

```bash
# Rebuild the application
npm run build

# Restart the application
npm run start
```

For Docker deployments:

```bash
# Rebuild and restart containers
docker compose down
docker compose up -d --build
```

## Enabling/Disabling Payment Methods

Once added to the schema, Super Admins can enable or disable payment methods through the Settings page:

1. Log in as Super Admin
2. Navigate to **Settings** → **Payments** tab
3. Check/uncheck the payment methods you want to enable
4. Click **Save Settings**

Changes take effect immediately for all users.

## Example: Adding M-Pesa

Here's a complete example for adding M-Pesa mobile money:

**1. Update `prisma/schema.prisma`:**

```prisma
enum PaymentMode {
  CASH
  CARD
  BANK_TRANSFER
  CRYPTO
  OTHER
  MPESA
}
```

**2. Update `src/lib/constants.ts`:**

```typescript
export const PAYMENT_MODE_VALUES = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "CRYPTO",
  "OTHER",
  "MPESA",
] as const;

export const PAYMENT_METHODS = [
  { label: "Cash", enum: "CASH" as PaymentMode },
  { label: "Card", enum: "CARD" as PaymentMode },
  { label: "Bank Transfer", enum: "BANK_TRANSFER" as PaymentMode },
  { label: "Crypto", enum: "CRYPTO" as PaymentMode },
  { label: "Other", enum: "OTHER" as PaymentMode },
  { label: "M-Pesa", enum: "MPESA" as PaymentMode },
] as const;
```

**3. Run migration:**

```bash
npx prisma migrate dev --name add_mpesa_payment
```

**4. Update `.env`:**

```bash
ENABLED_PAYMENT_METHODS=CASH,CARD,BANK_TRANSFER,MPESA
```

**5. Rebuild and restart:**

```bash
npm run build
npm run start
```

## Important Notes

### Database Migrations

- Always backup your database before running migrations
- Test migrations in a development environment first
- Existing sales records will not be affected
- The migration only adds new enum values, it doesn't modify existing data

### Naming Conventions

- Use UPPERCASE_SNAKE_CASE for enum values (e.g., `MOBILE_MONEY`)
- Use descriptive names that are clear to users
- Avoid special characters or spaces in enum values
- Keep labels user-friendly in the constants file

### Removing Payment Methods

To remove a payment method:

1. Ensure no sales records use that payment method
2. Remove it from the enum in the schema
3. Remove it from the constants file
4. Create and run a migration

**Warning**: Removing a payment method that's in use will cause database errors. Always check first:

```sql
SELECT COUNT(*) FROM "Sale" WHERE "paymentMode" = 'MOBILE_MONEY';
```

## Troubleshooting

### Migration Fails

If the migration fails:

- Check for syntax errors in the schema
- Ensure the database is accessible
- Verify no conflicting enum values exist

### Payment Method Not Showing

If the new payment method doesn't appear:

- Verify the constants file was updated correctly
- Clear browser cache
- Restart the application
- Check the Prisma client was regenerated

### Type Errors

If you see TypeScript errors:

- Regenerate Prisma client: `npx prisma generate`
- Restart your IDE/editor
- Check the constants file matches the schema exactly

## Support

For additional help:

- Check the [Environment Variables](../environment-variables.md) documentation
- Review the [Security Settings](./security.md) for related configuration
