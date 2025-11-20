# Backup & Restore

Complete guide for backing up and restoring your SaleSpider database.

## Overview

SaleSpider uses pgBackRest for reliable PostgreSQL backups with:

- Full and incremental backups
- Point-in-time recovery
- Automated scheduling
- Backup verification

::: info
This guide applies to self-hosted deployments. For hosted databases (Neon, Supabase, etc.), use your provider's backup tools.
:::

## Quick Start

### Create Backup

```bash
# Using Make
make backup

# Using Docker Compose
docker-compose exec postgres pgbackrest backup --stanza=main --type=full
```

### Restore Backup

```bash
# Restore latest backup
make restore

# Restore to specific time
make restore-pitr TIME="2024-11-20 14:30:00"
```

## Backup Operations

### Manual Backup

Create a backup on demand:

```bash
# Full backup
make backup

# View backup info
make backup-info
```

### Automated Backups

Backups run automatically when configured:

```bash
# In .env
SETUP_BACKUP="true"
BACKUP_FULL_SCHEDULE="0 2 * * 0"  # Weekly
BACKUP_INCR_SCHEDULE="0 2 * * 1-6"  # Daily
```

### Backup Types

**Full Backup**

- Complete database copy
- Required for restore
- Run weekly

**Incremental Backup**

- Only changes since last backup
- Faster and smaller
- Run daily

**Differential Backup**

- Changes since last full backup
- Middle ground option

## Restore Operations

### Full Restore

Restore complete database:

```bash
# Stop application
docker-compose stop app

# Restore database
make restore

# Start application
docker-compose start app
```

### Point-in-Time Recovery

Restore to specific timestamp:

```bash
# Restore to exact time
docker-compose exec postgres pgbackrest restore \
  --stanza=main \
  --type=time \
  --target="2024-11-20 14:30:00" \
  --delta
```

### Selective Restore

Restore specific database:

```bash
# Restore single database
docker-compose exec postgres pgbackrest restore \
  --stanza=main \
  --db-include=salespider
```

## Backup Management

### List Backups

View available backups:

```bash
# Show backup information
make backup-info

# Detailed backup list
docker-compose exec postgres pgbackrest info --stanza=main
```

### Verify Backups

Check backup integrity:

```bash
# Verify backup
docker-compose exec postgres pgbackrest check --stanza=main
```

### Delete Old Backups

Remove expired backups:

```bash
# Expire based on retention policy
docker-compose exec postgres pgbackrest expire --stanza=main
```

## Backup Storage

### Local Storage

Default backup location:

```
/var/lib/pgbackrest/
├── archive/
└── backup/
```

### Cloud Storage

Configure S3 or Azure storage:

```bash
# S3 Configuration
PGBACKREST_REPO1_TYPE="s3"
PGBACKREST_REPO1_S3_BUCKET="my-backups"
PGBACKREST_REPO1_S3_REGION="us-east-1"
```

### External Storage

Mount external drive:

```bash
# Mount backup drive
mount /dev/sdb1 /mnt/backups

# Update backup path
PGBACKREST_REPO1_PATH="/mnt/backups/pgbackrest"
```

## Disaster Recovery

### Recovery Steps

1. **Assess situation**
   - Identify what needs recovery
   - Determine recovery point

2. **Prepare for restore**

   ```bash
   docker-compose stop app
   ```

3. **Restore database**

   ```bash
   make restore
   ```

4. **Verify data**

   ```bash
   docker-compose exec postgres psql -U postgres -d salespider -c "\dt"
   ```

5. **Restart services**
   ```bash
   docker-compose start app
   ```

### Recovery Scenarios

**Complete Data Loss**

- Restore from latest full backup
- Apply incremental backups
- Verify data integrity

**Accidental Deletion**

- Use point-in-time recovery
- Restore to before deletion
- Verify specific data

**Corruption**

- Restore from last known good backup
- Check backup integrity first
- Test in staging if possible

## Monitoring

### Backup Status

Check backup health:

```bash
# View backup logs
docker-compose logs backup

# Check last backup
docker-compose exec postgres pgbackrest info
```

### Backup Logs

Log locations:

```
/var/log/pgbackrest/
├── main-backup.log
├── main-archive.log
└── main-restore.log
```

### Alerts

Monitor for:

- Backup failures
- Storage space issues
- Backup age warnings

## Best Practices

### Regular Testing

- Test restore monthly
- Verify backup integrity weekly
- Document restore procedures
- Train team on recovery

### Backup Schedule

- Full backup: Weekly
- Incremental: Daily
- Test restore: Monthly
- Off-site copy: Weekly

### Storage Management

- Monitor disk space
- Set retention policies
- Clean old backups
- Use compression

### Security

- Encrypt backups
- Secure storage location
- Restrict access
- Rotate encryption keys

## Troubleshooting

### Backup Fails

**Check logs:**

```bash
docker-compose logs backup
cat /var/log/pgbackrest/main-backup.log
```

**Common issues:**

- Disk space full
- Permission denied
- Database connection failed

**Solutions:**

- Free up disk space
- Check file permissions
- Verify database is running

### Restore Fails

**Verify backup:**

```bash
docker-compose exec postgres pgbackrest check
```

**Common issues:**

- Backup corrupted
- Insufficient space
- Wrong backup selected

**Solutions:**

- Use different backup
- Free up space
- Check backup integrity

### Slow Backups

**Optimize:**

- Use compression
- Incremental backups
- Faster storage
- Network optimization

## Advanced Topics

### Parallel Backup

Speed up backups:

```bash
# Use multiple processes
PGBACKREST_PROCESS_MAX=4
```

### Backup Encryption

Encrypt backups:

```bash
PGBACKREST_REPO1_CIPHER_TYPE="aes-256-cbc"
PGBACKREST_REPO1_CIPHER_PASS="secure-passphrase"
```

### Archive Management

Configure WAL archiving:

```bash
# Archive retention
PGBACKREST_RETENTION_ARCHIVE=2
```

## Related Documentation

- [Backup Configuration](/configuration/backup)
- [Self-Hosted Deployment](/deployment/self-hosted)
- [Makefile Commands](/operations/makefile)
- [Troubleshooting](/operations/troubleshooting)
