# Environment Variables Reference

This document provides a comprehensive reference for all environment variables used in SaleSpider. These variables control application behavior, deployment configuration, and system settings.

## Table of Contents

1. [Deployment Configuration](#deployment-configuration)
2. [Application Configuration](#application-configuration)
3. [Database Configuration](#database-configuration)
4. [SSL/HTTPS Configuration](#ssl-https-configuration)
5. [Backup Configuration](#backup-configuration)
6. [Cloud Storage Configuration](#cloud-storage-configuration)
7. [Development & Debugging](#development--debugging)
8. [Troubleshooting](#troubleshooting)

---

## Deployment Configuration

### Core Deployment Settings

| Variable               | Default                      | Description                                   | Required |
| ---------------------- | ---------------------------- | --------------------------------------------- | -------- |
| `COMPOSE_PROJECT_NAME` | `salespider`                 | Docker Compose project name prefix            | Yes      |
| `COMPOSE_FILE`         | `.docker/docker-compose.yml` | Docker Compose file to use                    | Yes      |
| `DOMAIN`               | `salespider.local`           | Primary domain for the application            | Yes      |
| `HOST_IP`              | `auto`                       | Server IP address (`auto` for auto-detection) | Yes      |
| `HTTP_PORT`            | `80`                         | HTTP port for the proxy                       | No       |
| `HTTPS_PORT`           | `443`                        | HTTPS port for the proxy                      | No       |

### Storage Paths

| Variable      | Default          | Description                        | Required |
| ------------- | ---------------- | ---------------------------------- | -------- |
| `DATA_PATH`   | `./data`         | Base directory for persistent data | Yes      |
| `BACKUP_PATH` | `./data/backups` | Directory for backup files         | Yes      |

**Usage Examples:**

```bash
# Internal company deployment
DOMAIN=salespider.company.com
HOST_IP=192.168.1.100

# Local development
DOMAIN=salespider.local
HOST_IP=127.0.0.1
```

---

## Application Configuration

### Core Application Settings

| Variable    | Default      | Description                                       | Required |
| ----------- | ------------ | ------------------------------------------------- | -------- |
| `NODE_ENV`  | `production` | Node.js environment (`production`, `development`) | Yes      |
| `APP_PORT`  | `3000`       | Port for the Next.js application                  | Yes      |
| `LOG_LEVEL` | `info`       | Logging level (`error`, `warn`, `info`, `debug`)  | No       |

### Security Configuration

| Variable        | Default                    | Description                              | Required |
| --------------- | -------------------------- | ---------------------------------------- | -------- |
| `JWT_SECRET`    | (none)                     | Secret key for JWT tokens (min 32 chars) | Yes      |
| `TOKEN_EXPIRY`  | `12h`                      | JWT token expiration time                | No       |
| `COOKIE_SECURE` | `true`                     | Enable secure cookies (HTTPS only)       | No       |
| `APP_URL`       | `https://salespider.local` | Base URL for the application             | Yes      |

### Admin Account

| Variable               | Default                  | Description               | Required |
| ---------------------- | ------------------------ | ------------------------- | -------- |
| `SUPER_ADMIN_EMAIL`    | `admin@salespider.local` | Super admin email address | Yes      |
| `SUPER_ADMIN_PASSWORD` | (none)                   | Super admin password      | Yes      |

### AI Configuration

| Variable         | Default | Description                           | Required |
| ---------------- | ------- | ------------------------------------- | -------- |
| `GEMINI_API_KEY` | (none)  | Google Gemini API key for AI features | No       |

### Default App Settings

These can be overridden through the application UI (Settings page, Super Admin only):

**Note on Payment Methods**: The available payment methods are defined in the database schema. To add custom payment methods:

1. Update `prisma/schema.prisma` to add new values to the `PaymentMode` enum
2. Update `src/lib/constants.ts` to add the new payment method to `PAYMENT_MODE_VALUES` and `PAYMENT_METHODS`
3. Create and run a Prisma migration: `npx prisma migrate dev --name add_payment_method`
4. Rebuild and redeploy the application

**Available Payment Methods** (defined in schema):

- `CASH` - Cash payments
- `CARD` - Card/credit card payments
- `BANK_TRANSFER` - Bank transfer payments
- `CRYPTO` - Cryptocurrency payments
- `OTHER` - Other payment methods

| Variable                  | Default                                | Description                                                            |
| ------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| `APP_NAME`                | `SaleSpider`                           | Application display name                                               |
| `APP_LOGO`                | (empty)                                | URL or path to application logo                                        |
| `PRIMARY_COLOR`           | `#3b82f6`                              | Primary theme color (hex)                                              |
| `SECONDARY_COLOR`         | `#10b981`                              | Secondary theme color (hex)                                            |
| `ACCENT_COLOR`            | `#f59e0b`                              | Accent theme color (hex)                                               |
| `CURRENCY`                | `NGN`                                  | Default currency code                                                  |
| `CURRENCY_SYMBOL`         | `₦`                                    | Currency symbol                                                        |
| `VAT_PERCENTAGE`          | `7.5`                                  | Default VAT/tax percentage                                             |
| `TIMEZONE`                | `Africa/Lagos`                         | Default timezone                                                       |
| `DATE_FORMAT`             | `dd/MM/yyyy`                           | Date display format                                                    |
| `TIME_FORMAT`             | `HH:mm`                                | Time display format                                                    |
| `LANGUAGE`                | `en`                                   | Default language (`en`, `fr`, `es`, `de`)                              |
| `THEME`                   | `light`                                | Default theme (`light`, `dark`)                                        |
| `MAINTENANCE_MODE`        | `false`                                | Enable maintenance mode                                                |
| `SHOW_DELETED_PRODUCTS`   | `false`                                | Show deleted products in lists                                         |
| `ENABLED_PAYMENT_METHODS` | `CASH,CARD,BANK_TRANSFER,CRYPTO,OTHER` | Comma-separated payment methods (must match Prisma schema enum values) |

### Client-Side Settings

These variables are exposed to the browser (prefixed with `NEXT_PUBLIC_`):

All the above app settings have corresponding `NEXT_PUBLIC_` versions that make them available on the client side.

### Feature Flags

| Variable           | Default | Description                  |
| ------------------ | ------- | ---------------------------- |
| `ENABLE_ANALYTICS` | `false` | Enable analytics features    |
| `ENABLE_REPORTS`   | `true`  | Enable reporting features    |
| `OFFLINE_MODE`     | `true`  | Enable offline functionality |

### Performance Settings

| Variable                 | Default | Description                           |
| ------------------------ | ------- | ------------------------------------- |
| `APP_MEMORY_LIMIT`       | `2G`    | Docker memory limit for app container |
| `APP_CPU_LIMIT`          | `2.0`   | Docker CPU limit for app container    |
| `APP_MEMORY_RESERVATION` | `1G`    | Docker memory reservation for app     |
| `APP_CPU_RESERVATION`    | `1.0`   | Docker CPU reservation for app        |
| `DATABASE_POOL_SIZE`     | `10`    | Database connection pool size         |
| `DATABASE_TIMEOUT`       | `30000` | Database query timeout (ms)           |
| `CACHE_TTL`              | `3600`  | Cache time-to-live (seconds)          |

---

## Database Configuration

### PostgreSQL Core Settings

| Variable            | Default       | Description                     | Required |
| ------------------- | ------------- | ------------------------------- | -------- |
| `POSTGRES_DB`       | `salespider`  | Database name                   | Yes      |
| `POSTGRES_USER`     | `postgres`    | Database username               | Yes      |
| `POSTGRES_PASSWORD` | (none)        | Database password               | Yes      |
| `POSTGRES_PORT`     | `5432`        | Database port                   | Yes      |
| `DATABASE_URL`      | (constructed) | Full database connection string | Yes      |

### PostgreSQL Performance Tuning

| Variable                        | Default | Description                       |
| ------------------------------- | ------- | --------------------------------- |
| `POSTGRES_MEMORY_LIMIT`         | `1G`    | Docker memory limit               |
| `POSTGRES_CPU_LIMIT`            | `1.0`   | Docker CPU limit                  |
| `POSTGRES_MEMORY_RESERVATION`   | `512M`  | Docker memory reservation         |
| `POSTGRES_CPU_RESERVATION`      | `0.5`   | Docker CPU reservation            |
| `POSTGRES_SHARED_BUFFERS`       | `256MB` | PostgreSQL shared buffers         |
| `POSTGRES_EFFECTIVE_CACHE_SIZE` | `1GB`   | PostgreSQL cache size hint        |
| `POSTGRES_WORK_MEM`             | `4MB`   | Memory for sort/hash operations   |
| `POSTGRES_MAINTENANCE_WORK_MEM` | `64MB`  | Memory for maintenance operations |
| `POSTGRES_MAX_CONNECTIONS`      | `100`   | Maximum concurrent connections    |
| `POSTGRES_MAX_WAL_SENDERS`      | `3`     | Maximum WAL sender processes      |
| `POSTGRES_WAL_KEEP_SIZE`        | `1GB`   | WAL retention size                |

### PostgreSQL Logging

| Variable                              | Default | Description                                      |
| ------------------------------------- | ------- | ------------------------------------------------ |
| `POSTGRES_LOG_STATEMENT`              | `none`  | Log SQL statements (`none`, `ddl`, `mod`, `all`) |
| `POSTGRES_LOG_MIN_DURATION_STATEMENT` | `1000`  | Log slow queries (ms, -1 to disable)             |

---

## SSL/HTTPS Configuration

| Variable              | Default    | Description                           |
| --------------------- | ---------- | ------------------------------------- |
| `SSL_ENABLED`         | `true`     | Enable SSL/HTTPS                      |
| `FORCE_HTTPS`         | `true`     | Redirect HTTP to HTTPS                |
| `SECURITY_HEADERS`    | `true`     | Enable security headers               |
| `HSTS_ENABLED`        | `true`     | Enable HTTP Strict Transport Security |
| `HSTS_MAX_AGE`        | `31536000` | HSTS max age (seconds)                |
| `RATE_LIMIT_ENABLED`  | `true`     | Enable rate limiting                  |
| `RATE_LIMIT_REQUESTS` | `100`      | Rate limit requests per window        |
| `RATE_LIMIT_WINDOW`   | `1m`       | Rate limit time window                |

---

## Backup Configuration

### pgBackRest Settings

**Note:** Backup configuration only applies to self-hosted database deployments. For hosted database providers (Neon, Supabase, etc.), set `PGBACKREST_REPO1_TYPE=none` and `SETUP_BACKUP=false` as the provider manages backups.

| Variable                | Default               | Description                                       | Required    |
| ----------------------- | --------------------- | ------------------------------------------------- | ----------- |
| `PGBACKREST_REPO1_TYPE` | `none`                | **Backup repository type** (see details below)    | Yes         |
| `PGBACKREST_REPO1_PATH` | `/var/lib/pgbackrest` | Local backup path (used with `posix` type)        | Conditional |
| `BACKUP_SCHEDULE_FULL`  | `0 2 * * 0`           | Full backup cron schedule (weekly at 2 AM Sunday) | No          |
| `BACKUP_RETENTION_FULL` | `7`                   | Number of full backups to retain                  | No          |
| `BACKUP_RETENTION_DIFF` | `3`                   | Number of differential backups to retain          | No          |

#### PGBACKREST_REPO1_TYPE Values

- **`none`** (default): No backup system. Fastest setup, no cloud storage required. Recommended for:
  - Initial testing and development
  - Hosted database deployments (provider manages backups)
  - Environments where backups are handled externally

- **`posix`**: Local filesystem backups. Stores backups on the local disk or mounted volume. Recommended for:
  - Self-hosted deployments with dedicated backup storage
  - When using external drives or network-attached storage (NAS)
  - **Important:** Use a separate partition or external drive to avoid filling the system disk
  - **Required variables:** `PGBACKREST_REPO1_PATH`

- **`s3`**: AWS S3 cloud backups. Stores backups in Amazon S3 or S3-compatible storage. Recommended for:
  - Production deployments requiring off-site backups
  - Automated disaster recovery scenarios
  - **Required variables:** `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
  - **Optional variables:** `AWS_S3_ENDPOINT` (for S3-compatible services)

- **`azure`**: Azure Blob Storage backups. Stores backups in Microsoft Azure. Recommended for:
  - Azure-hosted deployments
  - Organizations using Azure infrastructure
  - **Required variables:** `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_KEY`, `AZURE_STORAGE_CONTAINER`

- **`gcs`**: Google Cloud Storage backups. Stores backups in Google Cloud. Recommended for:
  - Google Cloud-hosted deployments
  - Organizations using Google Cloud infrastructure
  - **Required variables:** `GCS_BUCKET`, `GCS_KEY` (service account JSON)

### Backup Resource Limits

| Variable                    | Default | Description                              |
| --------------------------- | ------- | ---------------------------------------- |
| `BACKUP_MEMORY_LIMIT`       | `512M`  | Docker memory limit for backup container |
| `BACKUP_CPU_LIMIT`          | `0.5`   | Docker CPU limit for backup container    |
| `BACKUP_MEMORY_RESERVATION` | `256M`  | Docker memory reservation                |
| `BACKUP_CPU_RESERVATION`    | `0.25`  | Docker CPU reservation                   |

---

## Cloud Storage Configuration

**Note:** These variables are only required when using cloud-based backups with self-hosted databases. Not applicable for hosted database deployments.

### AWS S3 (set `PGBACKREST_REPO1_TYPE=s3`)

**Required for S3 backups only.** These variables must be set when `PGBACKREST_REPO1_TYPE=s3`.

| Variable                | Default                       | Description                                  | Required |
| ----------------------- | ----------------------------- | -------------------------------------------- | -------- |
| `AWS_ACCESS_KEY_ID`     | (none)                        | AWS access key                               | Yes      |
| `AWS_SECRET_ACCESS_KEY` | (none)                        | AWS secret key                               | Yes      |
| `AWS_REGION`            | `eu-north-1`                  | AWS region                                   | Yes      |
| `AWS_S3_BUCKET`         | (none)                        | S3 bucket name                               | Yes      |
| `AWS_S3_ENDPOINT`       | `s3.eu-north-1.amazonaws.com` | S3 endpoint URL (for S3-compatible services) | No       |

### Azure Blob Storage (set `PGBACKREST_REPO1_TYPE=azure`)

**Required for Azure backups only.** These variables must be set when `PGBACKREST_REPO1_TYPE=azure`.

| Variable                  | Default | Description                | Required |
| ------------------------- | ------- | -------------------------- | -------- |
| `AZURE_STORAGE_ACCOUNT`   | (none)  | Azure storage account name | Yes      |
| `AZURE_STORAGE_KEY`       | (none)  | Azure storage account key  | Yes      |
| `AZURE_STORAGE_CONTAINER` | (none)  | Azure blob container name  | Yes      |

### Google Cloud Storage (set `PGBACKREST_REPO1_TYPE=gcs`)

**Required for GCS backups only.** These variables must be set when `PGBACKREST_REPO1_TYPE=gcs`.

| Variable     | Default | Description                    | Required |
| ------------ | ------- | ------------------------------ | -------- |
| `GCS_BUCKET` | (none)  | GCS bucket name                | Yes      |
| `GCS_KEY`    | (none)  | GCS service account key (JSON) | Yes      |

---

## Development & Debugging

### Setup Control Variables

| Variable       | Default | Description                                    | Use Cases                                                                                       |
| -------------- | ------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `SKIP_SEED`    | `false` | Skip database seeding during setup             | • Database already has data<br>• Redeployment without data loss<br>• Testing with existing data |
| `FORCE_RESET`  | `false` | Force database reset and recreate              | • Fresh start needed<br>• Database corruption<br>• Schema changes require reset                 |
| `SETUP_BACKUP` | `true`  | Configure backup system during setup           | • Self-hosted deployments<br>• Set to `false` for hosted DB                                     |
| `KEEP_RUNNING` | `false` | Keep setup containers running after completion | • Debugging setup issues<br>• Inspecting setup logs<br>• Development troubleshooting            |

### Development Settings

| Variable          | Default | Description                                           |
| ----------------- | ------- | ----------------------------------------------------- |
| `DEBUG`           | `false` | Enable debug mode (set to `false` in production)      |
| `VERBOSE_LOGGING` | `false` | Enable verbose logging (set to `false` in production) |

### Logging

| Variable             | Default | Description           |
| -------------------- | ------- | --------------------- |
| `ACCESS_LOG_ENABLED` | `true`  | Enable access logging |
| `ERROR_LOG_ENABLED`  | `true`  | Enable error logging  |

---

## Troubleshooting

### Common Setup Issues

#### Database Connection Problems

```bash
# Check database variables
POSTGRES_PASSWORD=SecurePassword123!
DATABASE_URL="postgresql://postgres:SecurePassword123!@postgres:5432/salespider?schema=public"

# For hosted databases
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
SETUP_BACKUP=false
```

#### SSL Certificate Issues

```bash
# Force certificate regeneration
rm -rf .docker/ssl/*
.docker/scripts/setup/setup-ssl.sh

# Disable HTTPS for testing
SSL_ENABLED=false
FORCE_HTTPS=false
```

#### Memory Issues

```bash
# Reduce memory limits for low-memory systems
APP_MEMORY_LIMIT=1G
APP_MEMORY_RESERVATION=512M
POSTGRES_MEMORY_LIMIT=512M
POSTGRES_SHARED_BUFFERS=128MB
```

#### Skip Setup Steps

```bash
# Skip seeding if database has data
SKIP_SEED=true

# Skip backup setup for hosted databases
SETUP_BACKUP=false

# Keep setup container running for debugging
KEEP_RUNNING=true
```

### Development vs Production Settings

#### Development

```bash
NODE_ENV=development
DEBUG=true
VERBOSE_LOGGING=true
SKIP_SEED=false
DOMAIN=salespider.local
HOST_IP=127.0.0.1
```

#### Production

```bash
NODE_ENV=production
DEBUG=false
VERBOSE_LOGGING=false
SKIP_SEED=true  # After initial deployment
DOMAIN=salespider.company.com
HOST_IP=192.168.1.100
```

#### Hosted Database Deployment

```bash
COMPOSE_FILE=.docker/docker-compose.hosted-db.yml
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
SETUP_BACKUP=false
```

### Environment Variable Validation

The system validates critical environment variables on startup. Missing required variables will cause deployment to fail with clear error messages.

**Required Variables:**

- `JWT_SECRET` (min 32 characters)
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- `POSTGRES_PASSWORD` (for self-hosted)
- `DATABASE_URL` (for hosted database)

### Getting Help

If you encounter issues:

1. Check the logs: `docker compose logs`
2. Verify environment variables: `docker compose config`
3. Test database connection: `make db-test` (if available)
4. Review this documentation for proper variable formats
5. Check the troubleshooting section for your specific issue

---

**Note:** Always secure sensitive variables like passwords and API keys. Never commit `.env` files to version control.
