# SaleSpider Database Restore Guide

## Overview
This guide covers how to restore your SaleSpider PostgreSQL database from pgBackRest backups stored in AWS S3 (or Azure/GCS).

---

## 🚨 **Before You Start**

### Prerequisites
1. **Access to backup repository** (S3/Azure/GCS credentials in `.env`)
2. **Docker and Docker Compose** installed
3. **Same or newer version** of SaleSpider deployment
4. **Stopped PostgreSQL** service

### Important Notes
- **All data will be replaced** - Current database will be overwritten
- **Downtime required** - Application will be offline during restore
- **Backup first** - If you have current data you want to keep, back it up first

---

## 📋 **Restore Scenarios**

### Scenario 1: Restore Latest Backup (Most Common)

**Use Case:** Disaster recovery, moving to new server, testing backups

```bash
# 1. Stop PostgreSQL
docker compose -f .docker/docker-compose.yml stop postgres

# 2. List available backups
docker exec salespider-backup pgbackrest --stanza=salespider info

# 3. Restore latest backup
docker exec salespider-backup sh /scripts/restore.sh latest

# 4. Start PostgreSQL
docker compose -f .docker/docker-compose.yml start postgres

# 5. Verify
docker exec salespider-postgres psql -U postgres -d salespider -c "SELECT COUNT(*) FROM \"User\";"
```

---

### Scenario 2: Point-in-Time Recovery (PITR)

**Use Case:** Recover to specific moment before corruption/error occurred

```bash
# 1. Stop PostgreSQL
docker compose -f .docker/docker-compose.yml stop postgres

# 2. Find the time you want to restore to
# Example: Restore to 2 hours ago
TARGET_TIME=$(date -u -d '2 hours ago' '+%Y-%m-%d %H:%M:%S')

# 3. Restore to specific time
docker exec salespider-backup sh /scripts/restore.sh pitr "$TARGET_TIME"

# 4. Start PostgreSQL
docker compose -f .docker/docker-compose.yml start postgres
```

**Time Format:** `YYYY-MM-DD HH:MM:SS` (UTC timezone)

Examples:
```bash
# Restore to specific date and time
docker exec salespider-backup sh /scripts/restore.sh pitr "2024-10-04 15:30:00"

# Restore to midnight today
docker exec salespider-backup sh /scripts/restore.sh pitr "2024-10-04 00:00:00"
```

---

### Scenario 3: Restore Specific Backup Set

**Use Case:** Restore from a known good backup (e.g., before major changes)

```bash
# 1. Stop PostgreSQL
docker compose -f .docker/docker-compose.yml stop postgres

# 2. List all backups and find the set you want
docker exec salespider-backup pgbackrest --stanza=salespider info

# Example output:
# full backup: 20241004-163303F
#     timestamp start/stop: 2024-10-04 16:33:03 / 2024-10-04 16:34:23

# 3. Restore specific backup set
docker exec salespider-backup sh /scripts/restore.sh specific "20241004-163303F"

# 4. Start PostgreSQL
docker compose -f .docker/docker-compose.yml start postgres
```

---

## 🌐 **Restoring on a Different Server/Device**

### Prerequisites
- Docker and Docker Compose installed on new server
- SaleSpider repository cloned
- Same cloud storage credentials

### Steps

1. **Deploy SaleSpider** (without starting services):
```bash
git clone <your-repo>
cd SaleSpider
cp env.example .env
```

2. **Configure cloud storage** in `.env`:
```bash
# Use SAME credentials as original server
PGBACKREST_REPO1_TYPE=s3
AWS_S3_BUCKET=your-backup-bucket-name
AWS_REGION=eu-north-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_ENDPOINT=s3.eu-north-1.amazonaws.com
```

3. **Create Docker volumes**:
```bash
docker volume create salespider-postgres-data
docker volume create salespider-backup-data
docker volume create salespider-backup-logs
docker volume create salespider-postgres-backups
docker network create salespider-net
```

4. **Start only backup service**:
```bash
docker compose -f .docker/docker-compose.yml up -d backup
```

5. **Verify backup access**:
```bash
docker exec salespider-backup pgbackrest --stanza=salespider info
```

6. **Restore the backup**:
```bash
docker exec salespider-backup sh /scripts/restore.sh latest
```

7. **Start all services**:
```bash
./deploy.sh start
```

---

## 🔍 **Verification After Restore**

### 1. Check PostgreSQL Status
```bash
docker exec salespider-postgres pg_isready -U postgres
```

### 2. Verify Database Contents
```bash
# Check user count
docker exec salespider-postgres psql -U postgres -d salespider -c "SELECT COUNT(*) FROM \"User\";"

# Check product count
docker exec salespider-postgres psql -U postgres -d salespider -c "SELECT COUNT(*) FROM \"Product\";"

# Check latest sale
docker exec salespider-postgres psql -U postgres -d salespider -c "SELECT * FROM \"Sale\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

### 3. Test Application Access
```bash
# Open in browser
http://localhost/login

# Or check health endpoint
curl http://localhost/api/health
```

---

## ⚠️ **Troubleshooting**

### Error: "PostgreSQL is running"
```bash
# Stop PostgreSQL first
docker compose -f .docker/docker-compose.yml stop postgres
```

### Error: "Cannot access backup repository"
```bash
# Check cloud storage credentials in .env
cat .env | grep AWS_

# Verify network connectivity
docker exec salespider-backup ping -c 3 s3.eu-north-1.amazonaws.com

# Check pgBackRest configuration
docker exec salespider-backup cat /etc/pgbackrest/pgbackrest.conf
```

### Error: "Stanza does not exist"
```bash
# Create stanza first (only on new deployments)
docker exec salespider-backup pgbackrest --stanza=salespider stanza-create
```

### Restore takes too long
```bash
# Check restore progress
docker exec salespider-backup tail -f /var/log/pgbackrest/restore.log
```

---

## 📊 **Restore Time Estimates**

| Database Size | Restore Time | Network Dependency |
|--------------|--------------|-------------------|
| < 1GB | 1-3 minutes | Minimal |
| 1-10GB | 5-15 minutes | Moderate |
| 10-50GB | 15-60 minutes | High |
| > 50GB | 1+ hours | Very High |

**Factors affecting restore time:**
- Network speed (S3 download bandwidth)
- Database size
- Number of WAL files to replay
- Server I/O performance

---

## 🔐 **Security Considerations**

### Cloud Storage Access
- **Keep credentials secure** - Never commit `.env` to git
- **Use IAM roles** when possible (AWS EC2, Azure VM)
- **Rotate credentials** regularly
- **Monitor access logs** in cloud provider console

### Data Privacy
- **Encryption at rest** - S3/Azure/GCS encryption enabled
- **Encryption in transit** - TLS/HTTPS for all transfers
- **Access control** - Restrict bucket/container access

---

## 📚 **Additional Resources**

### pgBackRest Documentation
- [Official Docs](https://pgbackrest.org/)
- [User Guide](https://pgbackrest.org/user-guide.html)
- [Command Reference](https://pgbackrest.org/command.html)

### Backup Information
```bash
# List all backups
docker exec salespider-backup pgbackrest --stanza=salespider info

# Detailed JSON output
docker exec salespider-backup pgbackrest --stanza=salespider info --output=json

# Verify backup integrity
docker exec salespider-backup pgbackrest --stanza=salespider check
```

---

## 🆘 **Need Help?**

1. **Check logs**:
   ```bash
   docker logs salespider-backup
   cat .docker/logs/backup/restore.log
   ```

2. **Verify configuration**:
   ```bash
   docker exec salespider-backup pgbackrest --stanza=salespider info
   ```

3. **Test backup access**:
   ```bash
   docker exec salespider-backup pgbackrest --stanza=salespider check
   ```

---

## ✅ **Quick Reference**

```bash
# Restore latest backup
docker exec salespider-backup sh /scripts/restore.sh latest

# Restore to specific time
docker exec salespider-backup sh /scripts/restore.sh pitr "2024-10-04 15:30:00"

# Restore specific backup set
docker exec salespider-backup sh /scripts/restore.sh specific "20241004-163303F"

# List available backups
docker exec salespider-backup pgbackrest --stanza=salespider info

# Verify backup integrity
docker exec salespider-backup pgbackrest --stanza=salespider check
```
