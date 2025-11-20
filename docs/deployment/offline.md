# Offline Operation Guide

Learn how to deploy and operate SaleSpider without internet connectivity.

## Overview

SaleSpider can operate completely offline when deployed with a **self-hosted database**. This makes it perfect for stores in areas with unreliable internet connectivity or those who prefer complete independence from cloud services.

::: warning Important
Offline operation requires **self-hosted database deployment**. Hosted database and cloud platform deployments require continuous internet connectivity.
:::

## Deployment Requirements

To enable offline operation, you must:

1. **Use self-hosted database deployment** (PostgreSQL in Docker container)
2. **Deploy all services locally** (application, database, proxy)
3. **Configure local backups** (optional, but recommended)

## What Works Offline

When properly deployed with self-hosted database, these features work without internet:

### ✅ Core Operations

- **Sales recording and processing** - Record transactions, process payments
- **Inventory management** - Add, edit, delete products; track stock levels
- **Staff management** - Create users, manage roles and permissions
- **Dashboard and reporting** - View analytics, generate reports
- **Data export** - Export sales data and audit logs to CSV
- **Audit logging** - Track all user actions and changes
- **Search and filtering** - All product and sales searches
- **Receipt generation** - Generate and print receipts

### ✅ All Core Functionality

Every essential store operation works offline:

- Point of sale transactions
- Stock level updates
- User authentication and authorization
- Role-based access control
- Data persistence and retrieval

## What Requires Internet

Even with self-hosted deployment, these features need internet connectivity:

### ❌ AI Features

- **AI-powered recommendations** - Requires Google Gemini API
- **Inventory optimization suggestions** - Requires AI service
- **Demand forecasting** - Requires AI service

### ❌ Cloud Backups

- **S3 backups** - Requires AWS connectivity
- **Azure backups** - Requires Azure connectivity
- **GCS backups** - Requires Google Cloud connectivity

::: tip Use Local Backups
For offline deployments, use `PGBACKREST_REPO1_TYPE=posix` for local filesystem backups instead of cloud storage.
:::

### ❌ External Services

- **Software updates** - Pulling new Docker images or git updates
- **External integrations** - Any third-party API integrations
- **Email notifications** - If configured with external SMTP

## Deployment Configuration

### Step 1: Configure for Offline Operation

Edit your `.env` file:

```bash
# Use self-hosted database
DATABASE_URL="postgresql://postgres:YourPassword@postgres:5432/salespider?schema=public"

# Disable cloud backups (use local backups instead)
PGBACKREST_REPO1_TYPE=posix
PGBACKREST_REPO1_PATH=/var/lib/pgbackrest

# Disable AI features (optional)
GEMINI_API_KEY=  # Leave empty or remove

# Standard configuration
DOMAIN=salespider.local
HOST_IP=192.168.1.100  # Your local network IP
```

### Step 2: Deploy

```bash
make deploy
```

This will deploy:

- PostgreSQL database (local container)
- SaleSpider application (local container)
- Caddy proxy with SSL (local container)
- pgBackRest backup system (local, optional)

### Step 3: Verify Offline Operation

1. **Disconnect from internet**
2. **Access SaleSpider** at `https://192.168.1.100` (your HOST_IP)
3. **Test core operations**:
   - Log in
   - Record a sale
   - Add a product
   - View dashboard
   - Export data

Everything should work normally!

## Network Configuration

### Local Network Access

For offline operation within your local network:

```bash
# In .env
DOMAIN=salespider.local
HOST_IP=192.168.1.100  # Your server's local IP
```

**Access from:**

- Server: `https://localhost` or `https://192.168.1.100`
- Other PCs: `https://192.168.1.100`
- Mobile devices: `https://192.168.1.100`

### SSL Certificates for Offline

The system generates self-signed SSL certificates automatically. For offline operation:

1. **Accept certificate in browser** on first access
2. **Install certificate system-wide** for seamless access (optional)
3. **Distribute certificate** to all devices on your network

See the SSL/HTTPS Setup section in the [Deployment Guide](/deployment/) for details.

## Backup Strategy for Offline

### Local Filesystem Backups

Configure local backups for data protection:

```bash
# In .env
PGBACKREST_REPO1_TYPE=posix
PGBACKREST_REPO1_PATH=/var/lib/pgbackrest

# Backup schedule
BACKUP_SCHEDULE_FULL="0 2 * * 0"  # Weekly full backup
```

**Best Practices:**

- Use a separate partition or external drive for backups
- Regularly copy backups to another location (USB drive, NAS)
- Test restore procedures periodically
- Keep multiple backup copies

### Manual Backup Commands

```bash
# Create manual backup
make backup

# View backup information
make backup-info

# Restore from latest backup
make restore
```

See [Backup Guide](/operations/backup-restore) for complete backup documentation.

## Transitioning Between Online and Offline

### Going Offline

If you need to operate offline temporarily:

1. **Ensure recent backup** - `make backup`
2. **Verify local operation** - Test all features
3. **Disconnect internet** - System continues working
4. **Monitor disk space** - Ensure adequate space for operations

### Going Back Online

When internet connectivity returns:

1. **Reconnect to internet**
2. **Update software** (optional) - `git pull && make update`
3. **Sync cloud backups** (if configured) - Automatic
4. **Enable AI features** (optional) - Add `GEMINI_API_KEY`

## Troubleshooting Offline Operation

### Application Won't Start

**Check database connectivity:**

```bash
docker compose ps postgres
docker compose logs postgres
```

**Verify configuration:**

```bash
# Ensure using local database
grep DATABASE_URL .env
# Should show: postgresql://...@postgres:5432/...
```

### Can't Access from Other Devices

**Check firewall:**

```bash
# Allow ports 80 and 443
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

**Verify HOST_IP:**

```bash
# Check server IP
ip addr show
# Update .env if needed
```

### SSL Certificate Issues

**Regenerate certificates:**

```bash
rm -rf .docker/ssl/*
.docker/scripts/setup/setup-ssl.sh
docker compose restart proxy
```

**Install on client devices:**

- Copy `.docker/ssl/cert.pem` to client devices
- Install as trusted root certificate

## Performance Considerations

### Hardware Requirements

For smooth offline operation:

**Minimum:**

- 4GB RAM
- 2 CPU cores
- 20GB disk space

**Recommended:**

- 8GB RAM
- 4 CPU cores
- 50GB+ disk space (for backups)

### Optimization Tips

1. **Regular maintenance:**

   ```bash
   # Clean up Docker resources
   docker system prune -f
   ```

2. **Monitor disk space:**

   ```bash
   df -h
   du -sh data/
   ```

3. **Optimize database:**
   ```bash
   # Database vacuum (run periodically)
   docker exec salespider-postgres vacuumdb -U postgres -d salespider
   ```

## Best Practices

### 1. Regular Backups

- Schedule automatic backups
- Keep backups on separate storage
- Test restore procedures monthly

### 2. Redundancy

- Keep spare hardware available
- Maintain backup power supply (UPS)
- Document recovery procedures

### 3. Monitoring

- Check service status daily: `make status`
- Monitor disk space weekly
- Review logs for errors: `make logs`

### 4. Updates

- Plan update windows when internet is available
- Test updates in staging environment first
- Keep previous version available for rollback

## Comparison: Online vs Offline

| Aspect                    | Online (Internet)     | Offline (No Internet) |
| ------------------------- | --------------------- | --------------------- |
| **Core Operations**       | ✅ Full functionality | ✅ Full functionality |
| **AI Recommendations**    | ✅ Available          | ❌ Not available      |
| **Cloud Backups**         | ✅ Automatic          | ❌ Local only         |
| **Software Updates**      | ✅ Easy updates       | ⚠️ Manual when online |
| **External Integrations** | ✅ Available          | ❌ Not available      |
| **Data Security**         | ⚠️ Network dependent  | ✅ Fully local        |
| **Reliability**           | ⚠️ Internet dependent | ✅ Independent        |

## Frequently Asked Questions

### Can I switch between online and offline?

Yes! The system works the same way whether you have internet or not. AI features simply become unavailable when offline.

### What happens to data during offline operation?

All data is stored locally in PostgreSQL. Nothing is lost when offline. When you go back online, everything continues normally.

### Can I use cloud backups with offline operation?

You can configure cloud backups, but they only work when internet is available. Use local backups (`posix` type) for offline reliability.

### How do I update SaleSpider when offline?

You need internet connectivity to pull updates. Plan update windows when internet is available, or manually transfer update files.

### Can multiple stores operate offline independently?

Yes! Each store can run its own independent SaleSpider instance offline. Data can be synchronized manually when needed.

## Next Steps

- [Self-Hosted Deployment Guide](/deployment/#option-1-self-hosted-deployment) - Complete deployment instructions
- [Backup Configuration](/configuration/backup) - Set up local backups
- [Troubleshooting](/operations/troubleshooting) - Common issues and solutions
- [Makefile Commands](/operations/makefile) - Management commands

---

**Need help with offline deployment?** Check the [troubleshooting guide](/operations/troubleshooting) or [open an issue](https://github.com/IdrisAkintobi/SaleSpider/issues).
