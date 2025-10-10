# SaleSpider Backup Guide

Complete guide for configuring, managing, and monitoring database backups using pgBackRest with cloud storage support.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Backup Operations](#backup-operations)
5. [Restore Operations](#restore-operations)
6. [Cloud Storage Setup](#cloud-storage-setup)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
8. [Architecture](#architecture)

---

## Overview

SaleSpider uses **pgBackRest** for enterprise-grade PostgreSQL backups with the following features:

### ✅ **Key Features**
- **Enterprise-Grade Backups**: Full, differential, and incremental backups
- **Multi-Cloud Support**: S3, Azure Blob Storage, Google Cloud Storage
- **Point-in-Time Recovery**: WAL archiving for PITR
- **Compression & Encryption**: LZ4 compression, optional encryption
- **Automated Scheduling**: Cron-based backup automation
- **Monitoring & Alerts**: Webhook notifications

### **Backup Types**
1. **Full Backup**: Complete database backup (weekly by default)
2. **Differential Backup**: Changes since last full backup (daily)
3. **Incremental Backup**: Changes since last backup (continuous WAL archiving)

### **Deployment Types**
- **Self-hosted database**: Full backup system with pgBackRest
- **Hosted database** (Neon, Supabase, etc.): Backups managed by provider

---

## Quick Start

### For Self-Hosted Database

1. **Configure backup storage** in `.env`:
   ```bash
   # Enable backups
   SETUP_BACKUP=true
   PGBACKREST_REPO1_TYPE=s3

   # S3 configuration
   AWS_S3_BUCKET=your-backup-bucket
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

2. **Deploy with backups**:
   ```bash
   make deploy
   ```

3. **Verify backup setup**:
   ```bash
   make backup-info
   ```

### For Hosted Database

Backups are managed by your database provider. Set:
```bash
SETUP_BACKUP=false
PGBACKREST_REPO1_TYPE=none
```

---

## Configuration

### Environment Variables

Configure in your `.env` file:

#### **Repository Type**
```bash
# Repository type: none, posix, s3, azure, gcs
PGBACKREST_REPO1_TYPE=s3
PGBACKREST_REPO1_PATH=/var/lib/pgbackrest  # For posix type
```

#### **Backup Schedule & Retention**
```bash
# Backup schedules (cron format)
BACKUP_SCHEDULE_FULL="0 2 * * 0"    # Weekly full backup (Sundays at 2 AM)

# Retention policy
BACKUP_RETENTION_FULL=7             # Keep 7 full backups
BACKUP_RETENTION_DIFF=3             # Keep 3 differential backups
```

#### **Resource Limits**
```bash
# Backup container limits
BACKUP_MEMORY_LIMIT=512M
BACKUP_CPU_LIMIT=0.5
BACKUP_MEMORY_RESERVATION=256M
BACKUP_CPU_RESERVATION=0.25
```

#### **Notifications** (Optional)
```bash
BACKUP_WEBHOOK_URL=https://your-webhook-url
```

### Configuration Architecture

SaleSpider uses a **centralized configuration approach**:

```
Setup Service → Generates Config → Shared Volume → PostgreSQL & Backup Services
```

1. **Setup service** reads environment variables and base template
2. **Generates complete configuration** in shared Docker volume
3. **PostgreSQL and Backup services** mount the shared config (read-only)

**Benefits:**
- Single source of truth for configuration
- No configuration duplication
- Consistent settings across all services
- Easy maintenance and updates

---

## Backup Operations

### Manual Backup Commands

```bash
# Trigger manual full backup
make backup

# Check backup information
make backup-info

# Verify backup integrity
make backup-check

# View backup container logs
docker logs salespider-backup
```

### Advanced pgBackRest Commands

```bash
# List all backups (detailed)
docker exec salespider-backup pgbackrest --stanza=salespider info

# List backups (JSON format)
docker exec salespider-backup pgbackrest --stanza=salespider info --output=json

# Check backup system health
docker exec salespider-backup pgbackrest --stanza=salespider check

# Manual differential backup
docker exec salespider-backup pgbackrest --stanza=salespider --type=diff backup
```

### Automated Backups

Backups run automatically via cron schedules:
- **Full backups**: Weekly (configurable via `BACKUP_SCHEDULE_FULL`)
- **WAL archiving**: Continuous (automatic)

---

## Restore Operations

### Basic Restore Commands

```bash
# Restore latest backup
make restore-latest

# Restore specific backup
make restore-backup BACKUP_SET=20240101-120000F

# Point-in-time recovery
make restore-pitr TARGET="2024-01-01 12:00:00"
```

### Advanced Restore Commands

```bash
# List available restore points
docker exec salespider-backup pgbackrest --stanza=salespider info

# Restore latest backup
docker exec salespider-backup pgbackrest --stanza=salespider restore

# Restore specific backup set
docker exec salespider-backup pgbackrest --stanza=salespider \
  --set=20240101-120000F restore

# Point-in-time recovery to specific timestamp
docker exec salespider-backup pgbackrest --stanza=salespider \
  --type=time --target="2024-01-01 12:00:00" restore

# Point-in-time recovery to transaction ID
docker exec salespider-backup pgbackrest --stanza=salespider \
  --type=xid --target="1000" restore
```

---

## Cloud Storage Setup

### AWS S3

1. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://your-backup-bucket
   ```

2. **Create IAM user** with the following policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:ListBucket",
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject"
         ],
         "Resource": [
           "arn:aws:s3:::your-backup-bucket",
           "arn:aws:s3:::your-backup-bucket/*"
         ]
       }
     ]
   }
   ```

3. **Configure in `.env`**:
   ```bash
   PGBACKREST_REPO1_TYPE=s3
   AWS_S3_BUCKET=your-backup-bucket
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   # AWS_S3_ENDPOINT=  # Optional: for S3-compatible services
   ```

### Azure Blob Storage

1. **Create storage account and container**
2. **Get access key from Azure portal**
3. **Configure in `.env`**:
   ```bash
   PGBACKREST_REPO1_TYPE=azure
   AZURE_STORAGE_ACCOUNT=your-storage-account
   AZURE_STORAGE_KEY=your-access-key
   AZURE_STORAGE_CONTAINER=your-container-name
   ```

### Google Cloud Storage

1. **Create GCS bucket**:
   ```bash
   gsutil mb gs://your-backup-bucket
   ```

2. **Create service account** with Storage Admin role
3. **Download service account key JSON**
4. **Configure in `.env`**:
   ```bash
   PGBACKREST_REPO1_TYPE=gcs
   GCS_BUCKET=your-backup-bucket
   GCS_KEY=/path/to/service-account-key.json
   ```

---

## Monitoring & Troubleshooting

### Health Checks

```bash
# Check overall backup system health
make backup-check

# View backup service logs
docker logs salespider-backup

# Check backup configuration
docker exec salespider-backup cat /etc/pgbackrest/pgbackrest.conf

# Test backup stanza
docker exec salespider-backup pgbackrest --stanza=salespider check
```

### Common Issues

#### **Backup Fails**

1. **Check pgBackRest logs**:
   ```bash
   docker exec salespider-backup cat /var/log/pgbackrest/backup-full.log
   ```

2. **Verify configuration**:
   ```bash
   docker exec salespider-backup cat /etc/pgbackrest/pgbackrest.conf
   ```

3. **Test stanza**:
   ```bash
   docker exec salespider-backup pgbackrest --stanza=salespider check
   ```

#### **Restore Fails**

1. **Check restore logs**:
   ```bash
   docker exec salespider-backup cat /var/log/pgbackrest/restore.log
   ```

2. **Verify backup exists**:
   ```bash
   docker exec salespider-backup pgbackrest --stanza=salespider info
   ```

#### **Cloud Storage Connection Issues**

**Test S3 connection:**
```bash
docker exec salespider-backup aws s3 ls s3://your-bucket-name
```

**Test Azure connection:**
```bash
docker exec salespider-backup az storage container list --account-name your-account
```

**Test GCS connection:**
```bash
docker exec salespider-backup gsutil ls gs://your-bucket-name
```

#### **Configuration Issues**

**Configuration not found:**
```bash
# Check if setup service ran successfully
docker compose logs setup

# Verify volume exists
docker volume ls | grep pgbackrest-config

# Check volume contents
docker run --rm -v pgbackrest-config:/config alpine ls -la /config
```

**Regenerate configuration:**
```bash
# Remove old config and regenerate
docker volume rm pgbackrest-config
docker volume create pgbackrest-config
docker compose up setup
docker compose restart postgres backup
```

### Performance Tuning

- **Compression**: LZ4 provides good balance of speed and compression
- **Concurrency**: Adjust parallel workers based on available resources
- **Network**: Use cloud storage in same region as database
- **Retention**: Balance storage costs with recovery requirements

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                        │
│  - WAL archiving enabled                                    │
│  - Continuous backup stream                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  pgBackRest Backup Service                                  │
│  - Full backups (weekly)                                    │
│  - Differential backups (daily)                             │
│  - WAL archiving (continuous)                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Cloud Storage (S3/Azure/GCS)                               │
│  - Compressed backups (LZ4)                                 │
│  - Encrypted (optional)                                     │
│  - Retention policy applied                                 │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Setup Service (runs first)               │
│                                                              │
│  1. Reads base template:                                    │
│     config/pgbackrest/pgbackrest.conf                       │
│                                                              │
│  2. Reads environment variables:                            │
│     - PGBACKREST_REPO1_TYPE                                 │
│     - S3/Azure/GCS credentials                             │
│                                                              │
│  3. Generates complete configuration:                       │
│     - pgbackrest.conf (base + static settings)             │
│     - conf.d/repo.conf (dynamic repository settings)       │
│                                                              │
│  4. Writes to shared volume:                                │
│     pgbackrest-config:/pgbackrest-config                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Shared Volume
                              ▼
┌──────────────────┐                  ┌──────────────────┐
│ PostgreSQL       │                  │ Backup Service   │
│                  │                  │                  │
│ Uses config for: │                  │ Uses config for: │
│ - WAL archiving  │                  │ - Full backups   │
│ - archive-push   │                  │ - Differential   │
└──────────────────┘                  └──────────────────┘
```

### Configuration Structure

```
/etc/pgbackrest/
├── pgbackrest.conf          # Base config (mounted from volume)
└── conf.d/
    └── repo.conf            # Dynamic config (generated at runtime)
```

---

## Security Best Practices

1. **Encryption**: Enable encryption at rest in cloud storage
2. **Access Control**: Use IAM roles with minimal permissions
3. **Secrets Management**: Store credentials securely (never commit to git)
4. **Network Security**: Use VPC endpoints for cloud storage
5. **Audit Logging**: Enable access logs in cloud storage
6. **Regular Testing**: Verify backup integrity and test restores

---

## Support

### Getting Help

1. **Check logs**: `docker logs salespider-backup`
2. **Verify configuration**: `docker exec salespider-backup pgbackrest --stanza=salespider check`
3. **Review pgBackRest documentation**: https://pgbackrest.org/
4. **Use Makefile commands**: `make backup-info`, `make backup-check`

### Related Documentation

- [Environment Variables Reference](ENVIRONMENT_VARIABLES.md) - Backup-related environment variables
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deployment options for different database types
- [Makefile Guide](MAKEFILE_GUIDE.md) - Available backup commands

---

**Note:** For hosted database deployments (Neon, Supabase, etc.), backups are managed by your provider. Check your provider's dashboard for backup options and restore procedures.