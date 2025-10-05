# pgBackRest Backup Configuration for SaleSpider

This directory contains the pgBackRest configuration for automated PostgreSQL backups to blob storage (S3, Azure Blob, or GCS).

## Features

- ✅ **Enterprise-Grade Backups**: Full, differential, and incremental backups
- ✅ **Multi-Cloud Support**: S3, Azure Blob Storage, Google Cloud Storage
- ✅ **Point-in-Time Recovery**: WAL archiving for PITR
- ✅ **Compression & Encryption**: LZ4 compression, optional encryption
- ✅ **Automated Scheduling**: Cron-based backup automation
- ✅ **Monitoring & Alerts**: Webhook and Slack notifications

## Configuration

### Environment Variables

Configure in `.env` file:

```bash
# Repository Type (s3, azure, or gcs)
PGBACKREST_REPO1_TYPE=s3

# S3 Configuration
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_ENDPOINT=  # Optional: for S3-compatible services

# Azure Configuration (alternative)
AZURE_STORAGE_CONTAINER=your-container
AZURE_STORAGE_ACCOUNT=your-account
AZURE_STORAGE_KEY=your-key

# GCS Configuration (alternative)
GCS_BUCKET=your-bucket
GCS_KEY=path-to-service-account-key.json

# Backup Schedule & Retention
BACKUP_SCHEDULE_FULL=0 2 * * 0   # Weekly full backup (Sundays at 2 AM)
BACKUP_SCHEDULE_DIFF=0 2 * * 1-6 # Daily differential (Mon-Sat at 2 AM)
BACKUP_RETENTION_FULL=8          # Keep 8 full backups (8 weeks)
BACKUP_RETENTION_DIFF=14         # Keep 14 differential backups (2 weeks)

# Notifications
BACKUP_WEBHOOK_URL=https://your-webhook-url
BACKUP_SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Backup Types

1. **Full Backup**: Complete database backup (weekly by default)
2. **Differential Backup**: Changes since last full backup (daily)
3. **Incremental Backup**: Changes since last backup (continuous WAL archiving)

### Retention Policy

Configured in `pgbackrest.conf`:
- Full backups: 7 retained
- Differential backups: 3 retained
- Automatic expiration of old backups

## Usage

### Manual Backup

```bash
# Trigger full backup
docker exec salespider-backup /usr/local/bin/backup-full.sh

# Check backup status
docker exec salespider-backup pgbackrest --stanza=salespider info

# List all backups
docker exec salespider-backup pgbackrest --stanza=salespider info --output=json
```

### Restore Operations

```bash
# Restore latest backup
docker exec salespider-backup pgbackrest --stanza=salespider restore

# Restore specific backup
docker exec salespider-backup pgbackrest --stanza=salespider --set=20240101-120000F restore

# Point-in-time recovery
docker exec salespider-backup pgbackrest --stanza=salespider --type=time --target="2024-01-01 12:00:00" restore
```

### Monitoring

```bash
# View backup logs
docker logs salespider-backup

# Check backup service health
docker exec salespider-backup pgbackrest --stanza=salespider check

# View monitoring logs
docker logs salespider-backup-monitor
```

## Blob Storage Setup

### AWS S3

1. Create S3 bucket
2. Create IAM user with S3 access
3. Set environment variables in `.env`

Required IAM permissions:
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
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### Azure Blob Storage

1. Create storage account
2. Create container
3. Get access key
4. Set environment variables in `.env`

### Google Cloud Storage

1. Create GCS bucket
2. Create service account with Storage Admin role
3. Download service account key JSON
4. Set environment variables in `.env`

## Troubleshooting

### Backup Fails

```bash
# Check pgBackRest logs
docker exec salespider-backup cat /var/log/pgbackrest/backup-full.log

# Verify configuration
docker exec salespider-backup cat /etc/pgbackrest/pgbackrest.conf

# Test stanza
docker exec salespider-backup pgbackrest --stanza=salespider check
```

### Restore Fails

```bash
# Check restore logs
docker exec salespider-backup cat /var/log/pgbackrest/restore.log

# Verify backup exists
docker exec salespider-backup pgbackrest --stanza=salespider info
```

### Connection Issues

```bash
# Test S3 connection
docker exec salespider-backup aws s3 ls s3://your-bucket-name

# Test Azure connection
docker exec salespider-backup az storage container list --account-name your-account

# Test GCS connection
docker exec salespider-backup gsutil ls gs://your-bucket-name
```

## Architecture

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
│  Blob Storage (S3/Azure/GCS)                                │
│  - Compressed backups (LZ4)                                 │
│  - Encrypted (optional)                                     │
│  - Retention policy applied                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Backup Monitoring                                          │
│  - Health checks                                            │
│  - Slack/Webhook alerts                                     │
│  - Automated cleanup                                        │
└─────────────────────────────────────────────────────────────┘
```

## Security Best Practices

1. **Encryption**: Enable encryption at rest in blob storage
2. **Access Control**: Use IAM roles with minimal permissions
3. **Secrets Management**: Store credentials securely (never commit to git)
4. **Network Security**: Use VPC endpoints for S3/Azure/GCS
5. **Audit Logging**: Enable access logs in blob storage

## Performance Tuning

- **Compression**: LZ4 provides good balance of speed and compression
- **Concurrency**: Adjust parallel workers based on available resources
- **Network**: Use blob storage in same region as database
- **Retention**: Balance storage costs with recovery requirements

## Support

For issues or questions:
1. Check logs: `docker logs salespider-backup`
2. Verify configuration: `docker exec salespider-backup pgbackrest --stanza=salespider check`
3. Review pgBackRest documentation: https://pgbackrest.org/
