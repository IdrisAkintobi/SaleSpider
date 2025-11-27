# Deployment Guide

Complete guide for deploying SaleSpider in different environments with various configuration options.

## Overview

SaleSpider offers flexible deployment options to match your infrastructure, connectivity, and operational requirements. Choose the option that best fits your needs.

## Deployment Options Comparison

| Feature               | Self-Hosted         | Hosted Database      | Cloud Platforms      |
| --------------------- | ------------------- | -------------------- | -------------------- |
| **Offline Operation** | ✅ Full support     | ❌ Requires internet | ❌ Requires internet |
| **Setup Complexity**  | Medium              | Low                  | Very Low             |
| **Monthly Cost**      | Infrastructure only | Database fees        | Platform fees        |
| **Data Control**      | Complete            | Shared               | Shared               |
| **Backup Management** | Self-managed        | Provider-managed     | Provider-managed     |
| **Scaling**           | Manual              | Manual               | Automatic            |
| **Maintenance**       | Self-managed        | Minimal              | Zero                 |

## Option 1: Self-Hosted Deployment

**Best for:** Complete control, offline operation, on-premises deployment

### What's Included

- PostgreSQL database container
- pgBackRest backup system
- Application container
- Caddy reverse proxy with SSL
- Monitoring and health checks

### Key Benefits

- ✅ **Full offline operation** - Works without internet connectivity
- ✅ **Complete data control** - Your infrastructure, your rules
- ✅ **Enterprise backups** - pgBackRest with cloud storage support
- ✅ **No recurring fees** - One-time infrastructure cost

### Quick Start

```bash
# 1. Create environment file
cp env.example .env

# 2. Configure settings
nano .env

# 3. Deploy
make deploy
```

[Read more about self-hosted deployment →](#option-1-self-hosted-deployment)

---

## Option 2: Hosted Database Deployment

**Best for:** Simplified management, reliable internet, managed services

### What's Included

- Application container only
- Caddy reverse proxy with SSL
- No local database or backup containers

### Supported Providers

- [Neon](https://neon.tech) (PostgreSQL)
- [Supabase](https://supabase.com) (PostgreSQL)
- [Railway](https://railway.app) (PostgreSQL)
- [Heroku Postgres](https://www.heroku.com/postgres)
- Any other hosted PostgreSQL provider

### Key Benefits

- ✅ **Managed database** - Provider handles backups and scaling
- ✅ **Simplified setup** - No database management needed
- ✅ **Automatic updates** - Provider manages database updates
- ⚠️ **Requires internet** - Continuous connectivity needed

### Quick Start

```bash
# 1. Create environment file
cp env.example .env

# 2. Configure for hosted database
nano .env
# Set: DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
# Set: PGBACKREST_REPO1_TYPE=none
# Set: SETUP_BACKUP=false

# 3. Deploy with hosted database
make deploy-hosted-db-app
```

**Important:** When using a hosted database provider, **do not enable the backup system**. Hosted providers manage their own backups.

[Read more about hosted database deployment →](#option-2-hosted-database-deployment)

---

## Option 3: Cloud Platform Deployment

**Best for:** Zero infrastructure management, automatic scaling, global access

### Supported Platforms

- [Vercel](https://vercel.com) - Best for Next.js with automatic scaling
- [Railway](https://railway.app) - All-in-one with database included
- [Render](https://render.com) - Simple deployments with free tier

### What's Included

- Serverless application hosting
- Automatic HTTPS and CDN
- Zero server management
- Hosted PostgreSQL database

### Key Benefits

- ✅ **Zero server management** - Platform handles everything
- ✅ **Automatic scaling** - Scales with your traffic
- ✅ **Global CDN** - Fast access worldwide
- ⚠️ **Requires internet** - Cloud-based deployment

### Quick Start

```bash
# 1. Create environment file from cloud template
cp .env.cloud.example .env

# 2. Configure your settings
nano .env

# 3. Deploy to your platform
# Make sure to use "npm run start:prod" as your start command
vercel --prod  # or railway up, or render deploy
```

::: tip
Most platforms automatically run migrations and seeding with `npm run start:prod`. Vercel requires manual seeding. See the [Cloud Platforms Guide](/deployment/cloud-platforms) for details.
:::

[Read more about cloud platform deployment →](#option-3-cloud-platform-deployment)

---

## Offline Operation Requirements

::: warning Important for Offline Operation
If you need SaleSpider to work without internet connectivity, you **must** use the **Self-Hosted Deployment** option with a local PostgreSQL database.

Hosted database and cloud platform deployments require continuous internet connectivity to function.
:::

### What Works Offline (Self-Hosted Only)

- ✅ Sales recording and processing
- ✅ Inventory management
- ✅ Staff management
- ✅ Report generation
- ✅ Data export (CSV)
- ✅ All core functionality

### What Requires Internet (All Deployments)

- ❌ AI-powered recommendations (Gemini API)
- ❌ Cloud backups (S3, Azure, GCS)
- ❌ External integrations
- ❌ Software updates

[Learn more about Offline Operation →](/deployment/offline)

---

## Platform-Specific Guides

### Linux

Standard Docker deployment works out of the box.

[Linux Deployment →](#platform-specific-guides)

### macOS

Use Docker Desktop for Mac.

[macOS Deployment →](#platform-specific-guides)

### Windows

Requires WSL 2 and Docker Desktop.

[Windows Deployment Guide →](/deployment/windows)

---

## Next Steps

After choosing your deployment option:

1. **[Configure Environment Variables](/environment-variables)** - Set up your configuration
2. **[Set Up Backups](/configuration/backup)** - Protect your data (self-hosted only)
3. **[Configure Security](/configuration/security)** - Secure your deployment
4. **[Monitor Your Deployment](/operations/monitoring)** - Keep track of system health

## Getting Help

- 📖 [Troubleshooting Guide](/operations/troubleshooting)
- 📧 [Contact Support](mailto:salespider2025@outlook.com)
- 💬 [GitHub Discussions](https://github.com/IdrisAkintobi/SaleSpider/discussions)
- 🐛 [Report Issues](https://github.com/IdrisAkintobi/SaleSpider/issues)
