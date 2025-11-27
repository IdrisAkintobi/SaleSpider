# SaleSpider Deployment Guide

Complete guide for deploying SaleSpider in different environments with various configuration options.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Options](#deployment-options)
3. [Configuration](#configuration)
4. [SSL/HTTPS Setup](#ssl-https-setup)
5. [Platform-Specific Instructions](#platform-specific-instructions)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

The fastest way to get SaleSpider running with all default settings:

::: danger Critical: Database Seeding Required
After deployment, you **must** seed the database to create the super admin account and essential data. Without this step, the application will not be functional and you won't be able to log in.

The `make deploy` command handles this automatically for self-hosted deployments. For cloud deployments, you must run `npm run seed:prod` manually after deployment.
:::

### Prerequisites

- **Docker 20.10+** with Docker Compose
- **4GB+ RAM** available
- **10GB+ disk space**
- **Internet connection** (for initial setup)

### Three-Step Deployment

```bash
# 1. Create your environment configuration file
cp env.example .env

# 2. Edit configuration (set passwords, domain, etc.)
nano .env

# 3. Deploy
make deploy
```

**Important:** The `.env` file is required for deployment. This is a security best practice that prevents accidental commits of sensitive credentials to version control. The `env.example` file serves as a template - copy it to `.env` and customize it with your specific configuration before deploying.

**That's it!** Your SaleSpider instance will be running with HTTPS. By default, backups are disabled for faster setup - see the [Backup Configuration](#backup-configuration) section to enable them if needed.

### Quick Commands

```bash
make help      # Show all available commands
make status    # Check service status
make logs      # View logs
make backup    # Create manual backup
make restart   # Restart all services
```

---

## Deployment Options

SaleSpider supports two main deployment configurations:

### Option 1: Self-Hosted Database (Full Stack)

**Best for:** Complete control, on-premises deployment, development environments

**What's included:**

- PostgreSQL database container
- pgBackRest backup system
- Application container
- Caddy reverse proxy with SSL
- Monitoring and health checks

**Setup:**

```bash
# Use default configuration
make deploy

# Or manually:
cp .env.example .env
nano .env  # Configure your settings
docker compose up -d
```

### Option 2: Hosted Database (Application Only)

**Best for:** Production deployments, managed database services, simplified maintenance

**Supported providers:**

- [Neon](https://neon.tech) (PostgreSQL)
- [Supabase](https://supabase.com) (PostgreSQL)
- [Railway](https://railway.app) (PostgreSQL)
- [Heroku Postgres](https://www.heroku.com/postgres)
- Any other hosted PostgreSQL provider

**What's included:**

- Application container only
- Caddy reverse proxy with SSL
- No local database or backup containers

**Important:** When using a hosted database provider, **do not enable the backup system**. Hosted database providers manage their own backups, snapshots, and point-in-time recovery. Running the SaleSpider backup system with a hosted database would be redundant and waste resources.

**Setup:**

```bash
# 1. Create your environment file
cp env.example .env

# 2. Configure for hosted database
nano .env
# Set: DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
# Set: PGBACKREST_REPO1_TYPE=none  (or leave as default)
# Set: SETUP_BACKUP=false

# 3. Deploy with hosted database
make deploy-hosted-db-app

# Or manually:
docker compose -f .docker/docker-compose.hosted-db.yml up -d
```

**Backup Management:** Your hosted database provider handles all backup operations. Refer to your provider's documentation for:

- Automated backup schedules
- Point-in-time recovery
- Backup retention policies
- Disaster recovery procedures

### Option 3: Cloud Platform Deployment (Serverless)

**Best for:** Zero infrastructure management, automatic scaling, global CDN

**Popular platforms:**

- [Vercel](https://vercel.com) - Best for Next.js apps with automatic scaling
- [Railway](https://railway.app) - All-in-one platform with database included
- [Render](https://render.com) - Simple deployments with free tier
- Any platform that supports Node.js 24+ and PostgreSQL

**What's included:**

- Serverless application hosting
- Automatic HTTPS and CDN
- Zero server management
- Hosted PostgreSQL database

**Quick Setup:**

```bash
# 1. Create environment file from cloud template
cp .env.cloud.example .env

# 2. Configure your settings
nano .env
# Set: DATABASE_URL (from your database provider)
# Set: JWT_SECRET
# Set: APP_URL (your app URL)
# Set: SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD

# 3. Deploy to your platform (see platform-specific guides below)
# Make sure to use "npm run start:prod" as your start command
vercel --prod  # or railway up, or render deploy
```

::: tip Automatic Database Setup
When you use `npm run start:prod` as your start command, SaleSpider automatically:

- ✅ Runs database migrations
- ✅ Seeds the super admin account (if it doesn't exist)
- ✅ Configures default application settings

**Exception:** Vercel requires one-time manual seeding after first deployment due to its serverless architecture.
:::

**Platform-Specific Deployment:**

#### Vercel + Neon Database

1. **Set up Neon database:**
   - Create account at https://neon.tech
   - Create new project
   - Copy connection string

2. **Deploy to Vercel:**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

   Or use Vercel dashboard to import from GitHub

3. **Configure environment variables in Vercel:**
   - Add all variables from `.env`
   - Update `APP_URL` with your Vercel URL

#### Railway (Database + Hosting)

1. **Create Railway project:**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Connect your repository

2. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-sets `DATABASE_URL`

3. **Add environment variables:**

   ```env
   JWT_SECRET=your-secret
   APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   SUPER_ADMIN_EMAIL=admin@example.com
   SUPER_ADMIN_PASSWORD=SecurePass123!
   SETUP_BACKUP=false
   ```

4. **Set build command:**
   - Build: `npm install && npx prisma migrate deploy && npm run build`
   - Start: `npm start`

#### Render + Supabase

1. **Set up Supabase database:**
   - Create account at https://supabase.com
   - Create new project
   - Copy connection string from Settings → Database

2. **Create Render web service:**
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect repository

3. **Configure service:**
   - Build: `npm install && npx prisma migrate deploy && npm run build`
   - Start: `npm start`
   - Add environment variables from `.env`

**Cost Estimates:**

- **Vercel + Neon**: Free tier available, $0-39/month for production
- **Railway**: $5 credit/month free, $20/month for production
- **Render + Supabase**: Free tier available, $32/month for production

---

## Configuration

### Essential Configuration

Edit your `.env` file with these required settings:

#### **Security Settings**

```bash
# JWT and authentication secrets (required)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Super admin account
SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=ChangeThisPassword123!
```

#### **Domain and Network**

```bash
# For internal company deployment
DOMAIN=salespider.yourcompany.com
HOST_IP=192.168.1.100

# For local development
DOMAIN=salespider.local
HOST_IP=127.0.0.1
```

#### **Database Configuration**

**For self-hosted database:**

```bash
POSTGRES_DB=salespider
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SecurePostgresPassword123!
DATABASE_URL="postgresql://postgres:SecurePostgresPassword123!@postgres:5432/salespider?schema=public"
```

**For hosted database:**

```bash
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
PGBACKREST_REPO1_TYPE=none  # Backups managed by provider
SETUP_BACKUP=false
```

### Backup Configuration

**By default, backups are disabled** to simplify initial setup. The backup system is only needed for self-hosted database deployments.

#### Disabling Backups (Default)

```bash
# Backups disabled - fastest setup
PGBACKREST_REPO1_TYPE=none
```

This is the recommended setting for:

- Initial testing and evaluation
- Development environments
- Deployments using hosted database providers (Neon, Supabase, etc.)

#### Enabling Backups

To enable backups for self-hosted databases, set `PGBACKREST_REPO1_TYPE` to one of the following:

**Local Filesystem Backups (posix):**

```bash
PGBACKREST_REPO1_TYPE=posix
PGBACKREST_REPO1_PATH=/var/lib/pgbackrest
```

Best for: Simple setups, local storage, testing backup functionality

**AWS S3 Cloud Backups (s3):**

```bash
PGBACKREST_REPO1_TYPE=s3
AWS_S3_BUCKET=your-backup-bucket
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

Best for: Production deployments, off-site backups, automatic retention

**Azure Blob Storage Backups (azure):**

```bash
PGBACKREST_REPO1_TYPE=azure
AZURE_STORAGE_ACCOUNT=your-account
AZURE_STORAGE_KEY=your-key
AZURE_STORAGE_CONTAINER=your-container
```

Best for: Azure-based infrastructure, enterprise deployments

**Google Cloud Storage Backups (gcs):**

```bash
PGBACKREST_REPO1_TYPE=gcs
GCS_BUCKET=your-backup-bucket
GCS_KEY=your-service-account-key
```

Best for: GCP-based infrastructure, multi-region backups

For detailed backup configuration, management, and recovery procedures, see:
📖 **[Backup Guide](BACKUP-GUIDE.MD)**

### Application Settings

These settings can be changed through the UI after deployment:

```bash
# Application branding
APP_NAME=SaleSpider
CURRENCY=NGN
CURRENCY_SYMBOL=₦
TIMEZONE=Africa/Lagos
LANGUAGE=en

# Feature flags
ENABLE_ANALYTICS=false
ENABLE_REPORTS=true
```

### Complete Configuration Reference

For detailed information about all available environment variables, see:
📖 **[Environment Variables Reference](ENVIRONMENT-VARIABLES.MD)**

---

## SSL/HTTPS Setup

SaleSpider automatically generates and configures SSL certificates for secure HTTPS access.

### For Internal Deployment (Default)

The system uses **self-signed certificates**, which is appropriate for internal tools:

1. **Certificates are generated automatically** during deployment
2. **Users need to accept browser warnings** once per browser
3. **Certificates can be trusted system-wide** for seamless access

### Browser Certificate Acceptance

#### Chrome/Edge/Brave

1. Visit `https://salespider.local` (or your domain)
2. Click **"Advanced"** or **"Show details"**
3. Click **"Proceed to site"** or **"Continue"**

#### Firefox

1. Visit your domain
2. Click **"Advanced"**
3. Click **"Accept the Risk and Continue"**

#### Safari

1. Visit your domain
2. Click **"Show Details"**
3. Click **"visit this website"**
4. Click **"Visit Website"** again to confirm

### System-Wide Certificate Trust (Optional)

For better user experience, install the certificate system-wide:

#### macOS

```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .docker/ssl/cert.pem
```

#### Linux (Ubuntu/Debian)

```bash
sudo cp .docker/ssl/cert.pem /usr/local/share/ca-certificates/salespider.crt
sudo update-ca-certificates
```

#### Windows

1. Double-click `.docker\ssl\cert.pem`
2. Install to **"Trusted Root Certification Authorities"**

### Mobile Device Access

#### iOS

1. Email the certificate file to yourself
2. Install the profile in Settings
3. Trust the certificate in **Certificate Trust Settings**

#### Android

1. Transfer certificate to device
2. Install via **Settings → Security → Encryption & credentials**

### Public Deployment (External Access)

For external/public access, modify the Caddyfile to use Let's Encrypt:

```bash
# In .docker/config/proxy/Caddyfile, change:
# tls /etc/caddy/certs/cert.pem /etc/caddy/certs/key.pem
# to:
# tls your-email@example.com
```

### Troubleshooting SSL

```bash
# Regenerate certificates
rm -rf .docker/ssl/*
.docker/scripts/setup/setup-ssl.sh

# Check certificate details
openssl x509 -in .docker/ssl/cert.pem -noout -text

# View Caddy logs
docker logs salespider-proxy
```

---

## Platform-Specific Instructions

### Linux

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Deploy SaleSpider
git clone <repository-url>
cd SaleSpider
make deploy
```

### macOS

```bash
# Install Docker Desktop from docker.com
# Or via Homebrew:
brew install --cask docker

# Deploy SaleSpider
git clone <repository-url>
cd SaleSpider
make deploy
```

### Windows

**⚠️ Windows users must use WSL 2 for deployment.**

For complete Windows deployment instructions, see: **[Windows Deployment Guide](WINDOWS-DEPLOYMENT.MD)**

**Quick start:**

1. Install **WSL 2** and **Ubuntu**
2. Install **Docker Desktop** with WSL 2 integration
3. Deploy from within Ubuntu (WSL):
   ```bash
   git clone <repository-url>
   cd SaleSpider
   make deploy
   ```

📖 **Full guide covers:** WSL setup, Docker configuration, firewall rules, SSL certificates, troubleshooting, and Windows-specific issues.

---

## Troubleshooting

### Common Issues

#### **Services Not Starting**

```bash
# Check service status
make status

# View logs
make logs

# Check resource usage
docker stats
```

#### **Database Connection Issues**

```bash
# Verify database is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test database connection
docker exec salespider-postgres psql -U postgres -d salespider -c "\dt"
```

#### **SSL Certificate Issues**

**Problem:** Browser shows certificate warnings or API calls fail with `ERR_CERT_AUTHORITY_INVALID`

**Cause:** Self-signed certificates are not trusted by browsers (this is normal for internal deployments)

**Solutions:**

1. **Accept certificate in browser** (affects all API calls):

   ```
   1. Visit https://your-domain-or-ip
   2. Click "Advanced" → "Proceed to site"
   3. This will fix API calls automatically
   ```

2. **Regenerate certificates** if corrupted:

   ```bash
   .docker/scripts/setup/setup-ssl.sh
   docker compose restart proxy
   ```

3. **Trust certificate system-wide** (optional):

   **On the server machine:**

   ```bash
   # macOS
   sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .docker/ssl/cert.pem

   # Linux
   sudo cp .docker/ssl/cert.pem /usr/local/share/ca-certificates/salespider.crt
   sudo update-ca-certificates
   ```

   **On other PCs in the network:**

   **Step 1: Get the certificate**

   Option A - Copy certificate file:

   ```bash
   # Share via network folder, USB, or email
   # From server: cp .docker/ssl/cert.pem /shared/folder/

   # Or serve temporarily via HTTP
   cd .docker/ssl && python3 -m http.server 8000
   # Other PCs visit: http://192.168.1.133:8000/cert.pem
   ```

   Option B - Export via browser:

   ```
   1. Visit https://192.168.1.133 (accept warning)
   2. Click padlock icon → "Certificate"
   3. Click "Details" tab → "Export" or "Copy to File"
   4. Save as cert.pem
   ```

   **Step 2: Install the certificate**

   System-wide installation:

   ```bash
   # macOS
   sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain cert.pem

   # Linux (Ubuntu/Debian)
   sudo cp cert.pem /usr/local/share/ca-certificates/salespider.crt
   sudo update-ca-certificates

   # Windows (PowerShell as Administrator)
   Import-Certificate -FilePath "cert.pem" -CertStoreLocation "Cert:\LocalMachine\Root"
   ```

   Browser-only installation:

   ```
   Chrome/Edge: Settings → Privacy → Security → Manage Certificates → Trusted Root → Import
   Firefox: Settings → Privacy → Certificates → View Certificates → Authorities → Import
   ```

4. **Check configuration**:

   ```bash
   # Check Caddy configuration
   docker exec salespider-proxy cat /etc/caddy/Caddyfile

   # View Caddy logs
   docker logs salespider-proxy
   ```

**Note:** Certificate warnings are normal and expected for internal tools using self-signed certificates.

#### **Memory Issues**

For systems with limited memory, reduce resource limits in `.env`:

```bash
APP_MEMORY_LIMIT=1G
APP_MEMORY_RESERVATION=512M
POSTGRES_MEMORY_LIMIT=512M
POSTGRES_SHARED_BUFFERS=128MB
```

#### **Port Conflicts**

If ports 80/443 are in use:

```bash
# Change ports in .env
HTTP_PORT=8080
HTTPS_PORT=8443

# Restart services
make restart
```

### Environment-Specific Troubleshooting

#### **Development Environment**

```bash
NODE_ENV=development
DEBUG=true
VERBOSE_LOGGING=true
SKIP_SEED=false
```

#### **Production Environment**

```bash
NODE_ENV=production
DEBUG=false
VERBOSE_LOGGING=false
SKIP_SEED=true  # After initial deployment
```

### Getting Help

1. **Check logs**: `make logs`
2. **Verify configuration**: `docker compose config`
3. **Test connectivity**: `make health`
4. **Review documentation**: Links below

---

## Related Documentation

- **[Environment Variables Reference](ENVIRONMENT-VARIABLES.MD)** - Complete variable reference
- **[Backup Guide](BACKUP-GUIDE.MD)** - Backup configuration and management
- **[Makefile Guide](MAKEFILE-GUIDE.MD)** - Available commands reference

---

## Migration Between Deployment Types

### From Self-Hosted to Hosted Database

1. **Export current database**:

   ```bash
   docker exec salespider-postgres pg_dump -U postgres salespider > backup.sql
   ```

2. **Import to hosted provider** (follow provider's instructions)

3. **Switch configuration**:

   ```bash
   # Update .env
   DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
   SETUP_BACKUP=false

   # Deploy with hosted database
   make deploy-hosted-db-app
   ```

### From Hosted Database to Self-Hosted

1. **Export from hosted provider**
2. **Update configuration** to use self-hosted settings
3. **Deploy**: `make deploy`
4. **Import data** to local PostgreSQL container

---

## Security Considerations

- **Change default passwords** immediately
- **Use strong JWT secrets** (min 32 characters)
- **Enable HTTPS** for all deployments
- **Regular backups** for self-hosted databases
- **Network isolation** for production deployments
- **Regular updates** of Docker images and dependencies

---

**Need help?** Check the logs with `make logs` or review the troubleshooting section above.
