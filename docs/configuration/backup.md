# Backup Configuration

Configure automated backups for your SaleSpider database using pgBackRest.

## Overview

SaleSpider uses pgBackRest for PostgreSQL backups, providing:

- Full and incremental backups
- Point-in-time recovery
- Backup encryption
- Automated scheduling
- Backup verification

::: info
Backup configuration only applies to self-hosted deployments. Hosted database providers (Neon, Supabase, etc.) manage backups automatically.
:::

## Quick Setup

### Enable Backups

In your `.env` file:

```bash
# Enable backup system
SETUP_BACKUP="true"

# Backup repository type
PGBACKREST_REPO1_TYPE="posix"

# Backup storage path
PGBACKREST_REPO1_PATH="/var/lib/pgbackrest"

# Log path
PGBACKREST_LOG_PATH="/var/log/pgbackrest"
```

### Deploy with Backups

```bash
# Using Docker Compose
docker-compose -f docker-compose.yml -f .docker/compose/backup.yml up -d

# Or using Make
make deploy
```

## Configuration Options

### Repository Types

**POSIX (Local Storage)**

```bash
PGBACKREST_REPO1_TYPE="posix"
PGBACKREST_REPO1_PATH="/var/lib/pgbackrest"
```

**S3 (Cloud Storage)**

```bash
PGBACKREST_REPO1_TYPE="s3"
PGBACKREST_REPO1_S3_BUCKET="my-backup-bucket"
PGBACKREST_REPO1_S3_REGION="us-east-1"
PGBACKREST_REPO1_S3_KEY="your-access-key"
PGBACKREST_REPO1_S3_KEY_SECRET="your-secret-key"
```

**Azure (Cloud Storage)**

```bash
PGBACKREST_REPO1_TYPE="azure"
PGBACKREST_REPO1_AZURE_CONTAINER="backups"
PGBACKREST_REPO1_AZURE_ACCOUNT="storageaccount"
PGBACKREST_REPO1_AZURE_KEY="account-key"
```

### Backup Schedule

Configure automatic backup frequency:

```bash
# Full backup schedule (cron format)
BACKUP_FULL_SCHEDULE="0 2 * * 0"  # Weekly on Sunday at 2 AM

# Incremental backup schedule
BACKUP_INCR_SCHEDULE="0 2 * * 1-6"  # Daily except Sunday at 2 AM
```

### Retention Policy

Set how long to keep backups:

```bash
# Keep full backups for 4 weeks
PGBACKREST_RETENTION_FULL=4

# Keep differential backups for 2 weeks
PGBACKREST_RETENTION_DIFF=2
```

### Compression

Configure backup compression:

```bash
# Compression type: none, gz, bz2, lz4, zst
PGBACKREST_COMPRESS_TYPE="lz4"

# Compression level (0-9)
PGBACKREST_COMPRESS_LEVEL=3
```

### Encryption

Enable backup encryption:

```bash
# Enable encryption
PGBACKREST_REPO1_CIPHER_TYPE="aes-256-cbc"

# Encryption passphrase
PGBACKREST_REPO1_CIPHER_PASS="your-secure-passphrase"
```

## Backup Types

### Full Backup

Complete copy of the database:

```bash
# Manual full backup
make backup

# Or using Docker
docker-compose exec postgres pgbackrest backup --stanza=main --type=full
```

### Incremental Backup

Only changes since last backup:

```bash
# Manual incremental backup
docker-compose exec postgres pgbackrest backup --stanza=main --type=incr
```

### Differential Backup

Changes since last full backup:

```bash
# Manual differential backup
docker-compose exec postgres pgbackrest backup --stanza=main --type=diff
```

## Backup Operations

### Create Backup

```bash
# Using Make
make backup

# Using Docker Compose
docker-compose exec postgres pgbackrest backup --stanza=main --type=full
```

### List Backups

```bash
# View backup information
make backup-info

# Or using Docker
docker-compose exec postgres pgbackrest info
```

### Verify Backup

```bash
# Verify backup integrity
docker-compose exec postgres pgbackrest check
```

### Restore Backup

```bash
# Restore latest backup
make restore

# Restore to specific point in time
make restore-pitr TIME="2024-11-20 14:30:00"
```

## Storage Locations

### Local Storage

Default location for POSIX backups:

```
/var/lib/pgbackrest/
├── archive/
│   └── main/
└── backup/
    └── main/
```

### Cloud Storage

For S3/Azure, backups are stored in your configured bucket/container.

## Monitoring

### Check Backup Status

```bash
# View backup info
docker-compose exec postgres pgbackrest info

# Check backup logs
docker-compose logs backup
```

### Backup Logs

Logs are stored at:

```
/var/log/pgbackrest/
├── main-backup.log
├── main-archive.log
└── main-restore.log
```

## Automated Backups

### Cron Schedule

Backups run automatically based on schedule:

```bash
# Weekly full backup
0 2 * * 0  # Sunday at 2 AM

# Daily incremental backup
0 2 * * 1-6  # Monday-Saturday at 2 AM
```

## Troubleshooting

### Backup Fails

Check logs:

```bash
docker-compose logs backup
cat /var/log/pgbackrest/main-backup.log
```

Common issues:

- Insufficient disk space
- Permission issues
- Database connection problems

### Restore Fails

Verify backup integrity:

```bash
docker-compose exec postgres pgbackrest check
```

Check restore logs:

```bash
cat /var/log/pgbackrest/main-restore.log
```

### Storage Full

Clean old backups:

```bash
# Expire old backups based on retention policy
docker-compose exec postgres pgbackrest expire --stanza=main
```

## Best Practices

### Regular Testing

- Test restore procedures monthly
- Verify backup integrity weekly
- Monitor backup success daily

### Storage Management

- Monitor disk space usage
- Set appropriate retention policies
- Use compression to save space
- Consider cloud storage for off-site backups

### Security

- Enable encryption for sensitive data
- Secure backup storage location
- Restrict access to backup files
- Rotate encryption keys periodically

## Disaster Recovery

### Recovery Plan

1. **Identify backup to restore**

   ```bash
   docker-compose exec postgres pgbackrest info
   ```

2. **Stop application**

   ```bash
   docker-compose stop app
   ```

3. **Restore database**

   ```bash
   make restore
   ```

4. **Verify data**

   ```bash
   docker-compose exec postgres psql -U postgres -d salespider
   ```

5. **Restart application**
   ```bash
   docker-compose start app
   ```

### Point-in-Time Recovery

Restore to specific timestamp:

```bash
# Restore to specific time
docker-compose exec postgres pgbackrest restore \
  --stanza=main \
  --type=time \
  --target="2024-11-20 14:30:00"
```

## Related Documentation

- [Backup & Restore Operations](/operations/backup-restore)
- [Self-Hosted Deployment](/deployment/self-hosted)
- [Environment Variables](/configuration/environment-variables)
