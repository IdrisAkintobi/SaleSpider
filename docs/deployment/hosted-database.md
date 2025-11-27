# Hosted Database Deployment

Deploy SaleSpider with a managed PostgreSQL database for simplified operations and automatic backups.

## Overview

Hosted database deployment combines:

- Your application (self-hosted or cloud platform)
- Managed PostgreSQL database (Neon, Supabase, etc.)
- Automatic database backups
- Simplified maintenance

## Supported Providers

- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Railway](https://railway.app) - All-in-one platform
- [Heroku Postgres](https://www.heroku.com/postgres) - Managed PostgreSQL
- Any other hosted PostgreSQL provider

## Quick Start

### 1. Set Up Database

#### Using Neon

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard
4. Format: `postgresql://user:password@host/database?sslmode=require`

#### Using Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use "Connection pooling" for production)
5. Format: `postgresql://postgres:password@host:6543/postgres`

#### Using Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy `DATABASE_URL` from variables
5. Railway auto-configures the connection

### 2. Configure Application

Create `.env` file:

```bash
# Database (from your provider)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRES_IN="7d"

# AI Features (optional)
GOOGLE_GENAI_API_KEY="your-google-ai-api-key"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Disable local backups (provider handles this)
SETUP_BACKUP="false"
PGBACKREST_REPO1_TYPE="none"
```

### 3. Deploy Application

#### Option A: Docker with Hosted Database

```bash
# Use hosted database compose file
docker-compose -f docker-compose.hosted-db.yml up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Seed database
docker-compose exec app npm run seed
```

#### Option B: Cloud Platform

Deploy to Vercel, Railway, or Render:

```bash
# Set environment variables on platform
DATABASE_URL=your-connection-string
JWT_SECRET=your-secret
SETUP_BACKUP=false

# Deploy
vercel --prod
# or
railway up
# or
render deploy
```

### 4. Initialize Database

```bash
# Run migrations and seed data
npx prisma migrate deploy
npm run seed:prod
```

## Provider-Specific Guides

### Neon Configuration

**Connection String Format:**

```
postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

**Best Practices:**

- Use connection pooling for production
- Enable autoscaling for variable load
- Set up branch databases for development

**Environment Variables:**

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
SETUP_BACKUP="false"
```

### Supabase Configuration

**Connection String Format:**

```
postgresql://postgres:password@db.xxx.supabase.co:6543/postgres
```

**Best Practices:**

- Use connection pooling (port 6543) for applications
- Use direct connection (port 5432) for migrations
- Enable SSL mode

**Environment Variables:**

```bash
# For application (pooled)
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:6543/postgres"

# For migrations (direct)
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

SETUP_BACKUP="false"
```

### Railway Configuration

**Automatic Setup:**
Railway automatically sets `DATABASE_URL` when you add PostgreSQL.

**Best Practices:**

- Use Railway's built-in PostgreSQL
- Enable automatic backups in dashboard
- Use private networking

**Environment Variables:**

```bash
# Railway sets this automatically
DATABASE_URL=${{Postgres.DATABASE_URL}}

SETUP_BACKUP="false"
```

### Heroku Postgres Configuration

**Connection String Format:**

```
postgresql://user:password@host.compute.amazonaws.com:5432/database
```

**Best Practices:**

- Use hobby-dev tier for testing
- Upgrade to standard for production
- Enable automated backups

**Environment Variables:**

```bash
DATABASE_URL="postgresql://user:password@host.compute.amazonaws.com:5432/database"
SETUP_BACKUP="false"
```

## Docker Compose Configuration

### Hosted Database Setup

Use the provided `docker-compose.hosted-db.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SETUP_BACKUP=false
    restart: unless-stopped
```

No PostgreSQL container needed!

## Backup Management

### Provider-Managed Backups

All supported providers handle backups automatically:

**Neon:**

- Automatic daily backups
- Point-in-time recovery
- Branch databases for testing

**Supabase:**

- Daily automated backups
- Manual backup creation
- Point-in-time recovery (paid plans)

**Railway:**

- Automatic backups
- One-click restore
- Backup retention based on plan

**Heroku:**

- Automated daily backups
- Manual backup creation
- Backup retention based on plan

### Accessing Backups

Check your provider's dashboard:

- Neon: Project → Backups
- Supabase: Database → Backups
- Railway: Database → Backups
- Heroku: Resources → Postgres → Durability

## Migration from Self-Hosted

### 1. Export Current Database

```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Or using Docker
docker-compose exec postgres pg_dump -U salespider salespider > backup.sql
```

### 2. Import to Hosted Database

```bash
# Import to new database
psql $NEW_DATABASE_URL < backup.sql
```

### 3. Update Configuration

```bash
# Update .env
DATABASE_URL="new-hosted-database-url"
SETUP_BACKUP="false"
```

### 4. Restart Application

```bash
docker-compose restart app
# or redeploy to cloud platform
```

## Monitoring

### Database Metrics

Check provider dashboards for:

- Connection count
- Query performance
- Storage usage
- CPU and memory usage

### Application Monitoring

```bash
# Check application logs
docker-compose logs -f app

# Monitor connections
# Check provider dashboard
```

## Troubleshooting

### Connection Issues

**SSL Required Error:**

```bash
# Add sslmode to connection string
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

**Connection Timeout:**

- Check firewall rules
- Verify IP whitelist (if applicable)
- Check connection limits

**Too Many Connections:**

- Use connection pooling
- Reduce max connections in app
- Upgrade database plan

### Migration Issues

**Migration Fails:**

```bash
# Use direct connection for migrations
DIRECT_URL="postgresql://user:pass@host:5432/db"

# Run migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

**Schema Drift:**

```bash
# Reset and reapply
npx prisma migrate reset
npx prisma migrate deploy
```

## Security

### Connection Security

- Always use SSL/TLS
- Use connection pooling
- Rotate credentials regularly
- Restrict IP access (if available)

### Access Control

- Use strong passwords
- Enable 2FA on provider account
- Limit database user permissions
- Use read-only replicas for reporting

## Benefits

- ✅ **Managed Backups** - Automatic daily backups
- ✅ **Automatic Updates** - Provider handles maintenance
- ✅ **Scalability** - Easy to scale up/down
- ✅ **High Availability** - Built-in redundancy
- ✅ **Monitoring** - Provider dashboards
- ✅ **Support** - Provider technical support

## Limitations

- ⚠️ **Internet Required** - Needs connectivity
- ⚠️ **Recurring Costs** - Monthly subscription
- ⚠️ **Provider Lock-in** - Migration effort required
- ⚠️ **Less Control** - Limited configuration options

## Related Documentation

- [Self-Hosted Deployment](/deployment/self-hosted)
- [Cloud Platforms](/deployment/cloud-platforms)
- [Environment Variables](/configuration/environment-variables)
