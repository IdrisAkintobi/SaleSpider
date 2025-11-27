# SaleSpider Backup Guide

Complete guide for configuring, managing, and monitoring database backups using pgBackRest with cloud storage support.

## Table of Contents

1. [Overview](#overview)
2. [Backup Types Explained](#backup-types-explained)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Backup Operations](#backup-operations)
6. [Restore Operations](#restore-operations)
7. [Cloud Storage Setup](#cloud-storage-setup)
8. [Network Resilience](#network-resilience)
9. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
10. [Architecture](#architecture)

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

## Backup Types Explained

SaleSpider supports multiple backup storage types to fit different deployment scenarios. Choose the type that best matches your infrastructure, budget, and recovery requirements.

### **none** - No Backups (Default)

**Description**: Disables the backup system entirely. No backup service runs, no storage is configured.

**Use Cases**:

- Development and testing environments
- Quick start deployments to evaluate SaleSpider
- Hosted database deployments (Neon, Supabase, etc.) where backups are managed by the provider
- Temporary or disposable instances

**Configuration**:

```bash
PGBACKREST_REPO1_TYPE=none
# or leave it empty/unset
```

**Trade-offs**:

- ✅ **Fastest setup** - No backup configuration required
- ✅ **No resource overhead** - Backup service doesn't run
- ✅ **No storage costs** - No backup storage needed
- ❌ **No disaster recovery** - Data loss if database fails
- ❌ **No point-in-time recovery** - Cannot restore to specific timestamps

**When to use**: Development, testing, or when using a hosted database provider that manages backups for you.

---

### **posix** - Local Filesystem Backups

**Description**: Stores backups on the local filesystem or mounted volumes. Backups are written to a directory on the host machine or a mounted network drive.

**Use Cases**:

- Self-hosted deployments with local storage
- Network-attached storage (NAS) setups
- Deployments where cloud storage is not available or desired
- Cost-conscious deployments with existing storage infrastructure

**Configuration**:

```bash
PGBACKREST_REPO1_TYPE=posix
PGBACKREST_REPO1_PATH=/var/lib/pgbackrest  # Local path for backups
```

**Trade-offs**:

- ✅ **Simple setup** - No cloud credentials required
- ✅ **Fast backups** - No network latency
- ✅ **No cloud costs** - Uses existing storage
- ✅ **Full control** - Complete ownership of backup data
- ⚠️ **Single point of failure** - Backups on same machine as database
- ❌ **No off-site protection** - Vulnerable to hardware failure, fire, theft
- ❌ **Manual off-site copies** - Requires additional scripts for off-site replication

**Best Practice**: Use a separate partition or external drive for backups to protect against disk failures. Consider periodic off-site copies for disaster recovery.

**When to use**: Self-hosted deployments with reliable local storage and a plan for off-site backup copies.

---

### **s3** - AWS S3 Cloud Backups

**Description**: Stores backups in Amazon S3 or S3-compatible storage services (MinIO, DigitalOcean Spaces, Wasabi, etc.).

**Use Cases**:

- Production deployments requiring off-site backups
- AWS-based infrastructure
- Multi-region disaster recovery
- Compliance requirements for off-site backups

**Configuration**:

```bash
PGBACKREST_REPO1_TYPE=s3
AWS_S3_BUCKET=your-backup-bucket
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
# AWS_S3_ENDPOINT=  # Optional: for S3-compatible services
```

**Trade-offs**:

- ✅ **Off-site protection** - Backups stored separately from database
- ✅ **High durability** - 99.999999999% (11 nines) durability
- ✅ **Scalable** - No storage limits
- ✅ **Multi-region** - Can replicate across regions
- ✅ **Lifecycle policies** - Automatic archival to cheaper storage tiers
- ⚠️ **Network dependency** - Requires internet connectivity
- ⚠️ **Storage costs** - Pay for storage and data transfer
- ⚠️ **Complexity** - Requires AWS account and IAM configuration

**Cost Optimization**: Use S3 Intelligent-Tiering or lifecycle policies to move old backups to cheaper storage classes (S3 Glacier).

**When to use**: Production deployments requiring reliable off-site backups with high durability guarantees.

---

### **azure** - Azure Blob Storage Backups

**Description**: Stores backups in Microsoft Azure Blob Storage.

**Use Cases**:

- Azure-based infrastructure
- Organizations with existing Azure subscriptions
- Multi-cloud disaster recovery strategies
- Compliance requirements for specific cloud providers

**Configuration**:

```bash
PGBACKREST_REPO1_TYPE=azure
AZURE_STORAGE_ACCOUNT=your-storage-account
AZURE_STORAGE_KEY=your-access-key
AZURE_STORAGE_CONTAINER=your-container-name
```

**Trade-offs**:

- ✅ **Off-site protection** - Backups stored separately from database
- ✅ **High durability** - Azure's redundancy options (LRS, GRS, RA-GRS)
- ✅ **Scalable** - No storage limits
- ✅ **Azure integration** - Native integration with Azure services
- ✅ **Tiered storage** - Hot, Cool, and Archive tiers for cost optimization
- ⚠️ **Network dependency** - Requires internet connectivity
- ⚠️ **Storage costs** - Pay for storage and data transfer
- ⚠️ **Complexity** - Requires Azure account and access key management

**Cost Optimization**: Use Cool or Archive storage tiers for older backups to reduce costs.

**When to use**: Azure-based deployments or organizations with existing Azure infrastructure.

---

### **gcs** - Google Cloud Storage Backups

**Description**: Stores backups in Google Cloud Storage.

**Use Cases**:

- Google Cloud Platform (GCP) infrastructure
- Organizations with existing GCP subscriptions
- Multi-cloud disaster recovery strategies
- Machine learning pipelines requiring backup data access

**Configuration**:

```bash
PGBACKREST_REPO1_TYPE=gcs
GCS_BUCKET=your-backup-bucket
GCS_KEY=/path/to/service-account-key.json
```

**Trade-offs**:

- ✅ **Off-site protection** - Backups stored separately from database
- ✅ **High durability** - 99.999999999% (11 nines) durability
- ✅ **Scalable** - No storage limits
- ✅ **GCP integration** - Native integration with GCP services
- ✅ **Storage classes** - Standard, Nearline, Coldline, Archive for cost optimization
- ⚠️ **Network dependency** - Requires internet connectivity
- ⚠️ **Storage costs** - Pay for storage and data transfer
- ⚠️ **Complexity** - Requires GCP project and service account setup

**Cost Optimization**: Use Nearline or Coldline storage classes for older backups to reduce costs.

**When to use**: GCP-based deployments or organizations with existing Google Cloud infrastructure.

---

### Comparison Table

| Feature                 | none     | posix               | s3            | azure               | gcs           |
| ----------------------- | -------- | ------------------- | ------------- | ------------------- | ------------- |
| **Setup Complexity**    | Minimal  | Low                 | Medium        | Medium              | Medium        |
| **Off-site Protection** | ❌       | ❌                  | ✅            | ✅                  | ✅            |
| **Storage Costs**       | Free     | Local only          | Pay-as-you-go | Pay-as-you-go       | Pay-as-you-go |
| **Network Required**    | No       | No                  | Yes           | Yes                 | Yes           |
| **Durability**          | N/A      | Depends on hardware | 11 nines      | High (configurable) | 11 nines      |
| **Best For**            | Dev/Test | Self-hosted         | AWS users     | Azure users         | GCP users     |

---

## Quick Start

### Option 1: No Backups (Default - Fastest Setup)

For development, testing, or hosted database deployments:

```bash
# In .env file
PGBACKREST_REPO1_TYPE=none
# or leave it empty/unset
```

**Deploy**:

```bash
make deploy
```

This is the **default configuration** - no backup service runs, fastest setup time.

---

### Option 2: Local Filesystem Backups (posix)

For self-hosted deployments with local storage:

1. **Configure in `.env`**:

   ```bash
   # Enable backups
   SETUP_BACKUP=true
   PGBACKREST_REPO1_TYPE=posix
   PGBACKREST_REPO1_PATH=/var/lib/pgbackrest

   # Backup schedule and retention
   BACKUP_SCHEDULE_FULL="0 2 * * 0"  # Weekly full backup (Sundays at 2 AM)
   BACKUP_RETENTION_FULL=7           # Keep 7 full backups
   BACKUP_RETENTION_DIFF=3           # Keep 3 differential backups
   ```

2. **Deploy with backups**:

   ```bash
   make deploy
   ```

3. **Verify backup setup**:
   ```bash
   make backup-info
   ```

**Best Practice**: Mount a separate partition or external drive to `/var/lib/pgbackrest` for better resilience.

---

### Option 3: AWS S3 Cloud Backups

For production deployments with off-site backups:

1. **Configure in `.env`**:

   ```bash
   # Enable backups
   SETUP_BACKUP=true
   PGBACKREST_REPO1_TYPE=s3

   # S3 configuration
   AWS_S3_BUCKET=your-backup-bucket
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   # AWS_S3_ENDPOINT=  # Optional: for S3-compatible services

   # Backup schedule and retention
   BACKUP_SCHEDULE_FULL="0 2 * * 0"  # Weekly full backup
   BACKUP_RETENTION_FULL=7           # Keep 7 full backups
   BACKUP_RETENTION_DIFF=3           # Keep 3 differential backups
   ```

2. **Deploy with backups**:

   ```bash
   make deploy
   ```

3. **Verify backup setup**:
   ```bash
   make backup-info
   make backup-check
   ```

---

### Option 4: Hosted Database (Neon, Supabase, etc.)

For hosted database deployments where backups are managed by the provider:

```bash
# In .env file
SETUP_BACKUP=false
PGBACKREST_REPO1_TYPE=none

# Use hosted database URL
DATABASE_URL=postgresql://user:password@your-hosted-db.example.com:5432/dbname
```

**Deploy**:

```bash
make deploy
```

**Note**: Your database provider manages backups. Check your provider's dashboard for backup options and restore procedures.

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

## Network Resilience

Understanding how the backup system behaves during network outages is critical for disaster recovery planning. This section explains the resilience mechanisms and provides recovery procedures.

### Backup Behavior During Network Outages

When using cloud storage (S3, Azure, GCS), network connectivity is required for backup operations. Here's how the system handles network outages:

#### **Normal Operation**

```
PostgreSQL → WAL files → pgBackRest → Cloud Storage
            (continuous)              (uploaded)
```

#### **During Network Outage**

```
PostgreSQL → WAL files → pgBackRest (queued) → [Network Down]
            (continuous)    ↓
                       Local Queue
                       (WAL files retained)
```

**What happens**:

1. **Database continues operating normally** - No impact on application performance
2. **WAL files accumulate locally** - PostgreSQL keeps WAL files until successfully archived
3. **pgBackRest queues operations** - Failed uploads are automatically queued for retry
4. **Automatic retry logic** - pgBackRest continuously attempts to reconnect and upload

#### **After Network Restoration**

```
Local Queue → pgBackRest → Cloud Storage
(WAL files)              (catch-up upload)
```

**What happens**:

1. **Automatic reconnection** - pgBackRest detects network restoration
2. **Queue processing** - Queued WAL files are uploaded in order
3. **Catch-up mode** - System uploads accumulated backups
4. **Normal operation resumes** - Once queue is cleared

### WAL Archiving Resilience

**Key Points**:

- PostgreSQL **will not delete** WAL files until they are successfully archived
- WAL files accumulate in `pg_wal` directory during outages
- Disk space is the primary constraint during extended outages
- No data loss occurs as long as disk space is available

**Monitoring WAL Disk Usage**:

```bash
# Check WAL directory disk usage
docker exec salespider-postgres df -h /var/lib/postgresql/data/pg_wal

# Count WAL files
docker exec salespider-postgres ls -1 /var/lib/postgresql/data/pg_wal | wc -l

# Check PostgreSQL logs for archiving status
docker logs salespider-postgres | grep -i "archive"
```

### Safe Outage Duration Calculation

The safe duration for a network outage depends on available disk space and database write volume.

**Formula**:

```
Safe Duration (hours) = Available Disk Space (GB) / (Write Rate (GB/hour) × 1.2)
```

The 1.2 multiplier accounts for WAL overhead and safety margin.

**Example Calculations**:

| Available Space | Write Rate  | Safe Duration        |
| --------------- | ----------- | -------------------- |
| 10 GB           | 100 MB/hour | ~83 hours (3.5 days) |
| 20 GB           | 200 MB/hour | ~83 hours (3.5 days) |
| 50 GB           | 500 MB/hour | ~83 hours (3.5 days) |
| 10 GB           | 1 GB/hour   | ~8 hours             |

**Determining Your Write Rate**:

```bash
# Monitor WAL generation over 1 hour
docker exec salespider-postgres psql -U postgres -d salespider -c \
  "SELECT pg_current_wal_lsn();"
# Wait 1 hour
docker exec salespider-postgres psql -U postgres -d salespider -c \
  "SELECT pg_current_wal_lsn();"
# Calculate difference to estimate hourly rate
```

### Recovery Procedures

#### **Short Outage Recovery** (< 24 hours)

For brief network interruptions, the system recovers automatically:

1. **Wait for automatic recovery**:

   ```bash
   # Monitor backup logs
   docker logs -f salespider-backup
   ```

2. **Verify catch-up progress**:

   ```bash
   # Check WAL archive queue
   docker exec salespider-postgres ls -lh /var/lib/postgresql/data/pg_wal
   ```

3. **Confirm backup integrity** (after catch-up):
   ```bash
   make backup-check
   make backup-info
   ```

**No manual intervention required** - pgBackRest handles everything automatically.

---

#### **Extended Outage Recovery** (> 24 hours)

For longer outages, monitor disk space and verify recovery:

1. **Check WAL disk usage**:

   ```bash
   docker exec salespider-postgres df -h /var/lib/postgresql/data/pg_wal
   ```

2. **Monitor network connectivity**:

   ```bash
   # Test cloud storage connection
   # For S3:
   docker exec salespider-backup aws s3 ls s3://your-bucket-name

   # For Azure:
   docker exec salespider-backup az storage container list --account-name your-account

   # For GCS:
   docker exec salespider-backup gsutil ls gs://your-bucket-name
   ```

3. **Monitor backup logs** for catch-up progress:

   ```bash
   docker logs -f salespider-backup
   ```

4. **Manually trigger backup** (if needed):

   ```bash
   make backup
   ```

5. **Verify backup integrity**:

   ```bash
   make backup-check
   make backup-info
   ```

6. **Check for gaps** in backup timeline:
   ```bash
   docker exec salespider-backup pgbackrest --stanza=salespider info --output=json
   ```

---

#### **Emergency Procedures** (Critical Disk Space)

If disk space becomes critically low during an outage:

⚠️ **Warning**: These are emergency procedures. Only use when disk space is critically low (< 10% free).

1. **Assess the situation**:

   ```bash
   # Check disk usage
   docker exec salespider-postgres df -h /var/lib/postgresql/data

   # Check WAL directory size
   docker exec salespider-postgres du -sh /var/lib/postgresql/data/pg_wal
   ```

2. **Temporarily disable WAL archiving** (emergency only):

   ```bash
   # Connect to PostgreSQL
   docker exec -it salespider-postgres psql -U postgres -d salespider

   # Disable archiving temporarily
   ALTER SYSTEM SET archive_mode = off;
   SELECT pg_reload_conf();
   ```

3. **Perform manual local backup**:

   ```bash
   # Create local backup directory
   mkdir -p ./emergency-backup

   # Dump database
   docker exec salespider-postgres pg_dump -U postgres salespider > \
     ./emergency-backup/salespider-$(date +%Y%m%d-%H%M%S).sql
   ```

4. **Clean up old WAL files** (after backup):

   ```bash
   # PostgreSQL will clean up automatically once archiving is disabled
   # Wait a few minutes for cleanup

   # Verify space recovered
   docker exec salespider-postgres df -h /var/lib/postgresql/data/pg_wal
   ```

5. **Restore network connectivity** and re-enable archiving:

   ```bash
   # Re-enable archiving
   docker exec -it salespider-postgres psql -U postgres -d salespider
   ALTER SYSTEM SET archive_mode = on;
   SELECT pg_reload_conf();

   # Restart PostgreSQL to apply changes
   docker restart salespider-postgres
   ```

6. **Upload emergency backup to cloud storage**:

   ```bash
   # Use cloud provider CLI to upload
   # For S3:
   aws s3 cp ./emergency-backup/ s3://your-bucket/emergency/ --recursive

   # For Azure:
   az storage blob upload-batch -d emergency -s ./emergency-backup/ \
     --account-name your-account

   # For GCS:
   gsutil -m cp -r ./emergency-backup/ gs://your-bucket/emergency/
   ```

7. **Verify backup system recovery**:
   ```bash
   make backup-check
   make backup-info
   ```

### Best Practices for Network Resilience

1. **Monitor disk space proactively**:
   - Set up alerts for disk usage > 70%
   - Monitor WAL directory size daily
   - Plan for 3-5 days of WAL accumulation

2. **Test recovery procedures**:
   - Simulate network outages in staging
   - Practice emergency procedures
   - Document your specific recovery times

3. **Maintain local backups**:
   - Even with cloud backups, keep recent local copies
   - Use `posix` type for local backup alongside cloud
   - Automate local backup rotation

4. **Plan for extended outages**:
   - Ensure adequate disk space (50+ GB for WAL)
   - Document emergency contacts for network issues
   - Have alternative network paths (backup ISP, mobile hotspot)

5. **Regular integrity checks**:

   ```bash
   # Weekly backup verification
   make backup-check

   # Monthly restore test
   make restore-latest  # In test environment
   ```

### Frequently Asked Questions

**Q: Will my database stop working during a network outage?**  
A: No. The database continues operating normally. Only backup uploads are affected.

**Q: Will I lose data if the network is down for several days?**  
A: No, as long as you have sufficient disk space for WAL files. PostgreSQL retains all WAL files until they're successfully archived.

**Q: How do I know if backups are catching up after an outage?**  
A: Monitor the backup logs (`docker logs -f salespider-backup`) and check WAL file count decreasing over time.

**Q: Should I use `posix` type as a backup to cloud storage?**  
A: Yes, for critical deployments. Configure both `posix` (local) and cloud storage for redundancy. This requires advanced pgBackRest configuration with multiple repositories.

**Q: What happens if disk fills up completely?**  
A: PostgreSQL will stop accepting writes to prevent data corruption. This is why monitoring disk space is critical. Follow emergency procedures immediately if space is low.

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

- [Environment Variables Reference](ENVIRONMENT-VARIABLES.MD) - Backup-related environment variables
- [Deployment Guide](DEPLOYMENT-GUIDE.MD) - Deployment options for different database types
- [Makefile Guide](MAKEFILE-GUIDE.MD) - Available backup commands

---

**Note:** For hosted database deployments (Neon, Supabase, etc.), backups are managed by your provider. Check your provider's dashboard for backup options and restore procedures.
