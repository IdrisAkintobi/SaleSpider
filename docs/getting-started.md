# Getting Started

Welcome to SaleSpider! This guide will help you get up and running quickly.

## Prerequisites

Before you begin, ensure you have:

- **Docker 20.10+** with Docker Compose
- **4GB+ RAM** available
- **10GB+ disk space**
- **Internet connection** (for initial setup)

## Quick Start

The fastest way to get SaleSpider running:

### Step 1: Clone the Repository

```bash
git clone https://github.com/IdrisAkintobi/SaleSpider.git
cd SaleSpider
```

### Step 2: Initial Setup

```bash
make setup
```

This command will:

- Make all scripts executable
- Create your `.env` file from the template
- Validate your environment

### Step 3: Configure Environment

Edit the `.env` file with your settings:

```bash
nano .env
```

**Essential settings to configure:**

```bash
# Domain Configuration
DOMAIN=salespider.yourcompany.local
HOST_IP=auto  # Will auto-detect

# Database Security
POSTGRES_PASSWORD=YourSecurePassword123!

# Application Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Admin Account
SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=SecureAdminPassword123!
```

### Step 4: Deploy

```bash
make deploy
```

This will:

- Check system requirements
- Generate SSL certificates
- Create Docker volumes
- Start all services
- Run database migrations
- **Seed initial data (required for application to function)**

**Deployment takes 2-5 minutes.** The process automatically sets up the database and creates your admin account.

### Step 5: Access SaleSpider

Once deployment is complete, access SaleSpider at:

- **Local**: https://localhost
- **Network**: https://YOUR_SERVER_IP
- **Domain**: https://salespider.yourcompany.local (if configured)

**Note:** You'll see an SSL certificate warning on first access. This is normal for self-signed certificates. Click "Advanced" → "Proceed to site".

## First Login

1. Navigate to your SaleSpider URL
2. Log in with your admin credentials:
   - **Email**: The `SUPER_ADMIN_EMAIL` you configured
   - **Password**: The `SUPER_ADMIN_PASSWORD` you configured

3. You'll be taken to the dashboard

## Next Steps

Now that SaleSpider is running, you can:

1. **[Configure Settings](/configuration/environment-variables)** - Customize application behavior
2. **[Set Up Backups](/configuration/backup)** - Protect your data
3. **[Add Users](/features/staff)** - Create staff accounts
4. **[Add Products](/features/inventory)** - Start managing inventory
5. **[Record Sales](/features/sales)** - Begin tracking transactions

## Common Commands

```bash
make status    # Check service status
make logs      # View logs
make restart   # Restart services
make backup    # Create manual backup
make help      # Show all commands
```

## Choosing Your Deployment Type

SaleSpider supports three deployment options:

### 🏠 Self-Hosted (Recommended for Offline Operation)

**Best for:**

- Stores with unreliable internet
- Complete data control requirements
- On-premises deployment needs

**Features:**

- ✅ Full offline operation
- ✅ Enterprise-grade backups
- ✅ Complete control

[Self-Hosted Guide →](/deployment/#option-1-self-hosted-deployment)

### ☁️ Hosted Database

**Best for:**

- Reliable internet connectivity
- Simplified maintenance
- Managed database services

**Features:**

- ✅ Managed backups
- ✅ Simplified setup
- ⚠️ Requires internet

[Hosted Database Guide →](/deployment/#option-2-hosted-database-deployment)

### 🚀 Cloud Platforms

**Best for:**

- Zero infrastructure management
- Automatic scaling
- Global access

**Features:**

- ✅ Serverless deployment
- ✅ Auto-scaling
- ⚠️ Requires internet

[Cloud Platforms Guide →](/deployment/#option-3-cloud-platform-deployment)

## Troubleshooting

### Services Not Starting

```bash
# Check service status
make status

# View logs
make logs

# Check resource usage
docker stats
```

### SSL Certificate Warnings

This is normal for self-signed certificates. You can:

1. **Accept in browser** (recommended for testing)
2. **Install certificate system-wide** (recommended for production)
3. **Use Let's Encrypt** (for public deployments)

See the SSL/HTTPS Setup section in the [Deployment Guide](/deployment/) for details.

### Port Conflicts

If ports 80/443 are in use:

```bash
# Change ports in .env
HTTP_PORT=8080
HTTPS_PORT=8443

# Restart services
make restart
```

## Getting Help

Need assistance?

- 📖 **[Read the Docs](/deployment/)** - Comprehensive guides
- 💬 **[GitHub Discussions](https://github.com/IdrisAkintobi/SaleSpider/discussions)** - Community support
- 🐛 **[Report Issues](https://github.com/IdrisAkintobi/SaleSpider/issues)** - Bug reports
- 📧 **[Contact](mailto:salespider2025@outlook.com)** - Direct support

## What's Next?

- [Deployment Guide](/deployment/) - Detailed deployment instructions
- [Configuration](/configuration/environment-variables) - All configuration options
- [Features](/features/) - Explore SaleSpider's capabilities
- [Operations](/operations/backup-restore) - Backup and maintenance
