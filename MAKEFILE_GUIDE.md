# SaleSpider Makefile Quick Reference

## 🚀 Getting Started

```bash
# View all available commands
make help

# Initial setup (makes scripts executable, checks .env)
make setup

# Full deployment
make deploy
```

---

## 📋 Common Commands

### Deployment
```bash
make deploy    # Full deployment (first time)
make start     # Start all services
make stop      # Stop all services  
make restart   # Restart with health checks
make status    # Show service status
```

### Monitoring
```bash
make logs              # All service logs
make logs SERVICE=app  # Specific service logs
make health            # Check all health statuses
```

### Backups
```bash
make backup         # Create manual backup now
make backup-info    # List available backups
make backup-check   # Verify backup integrity
```

---

## 🔄 Restore Commands

### Restore Latest Backup
```bash
make restore
```
**What it does:**
1. Stops PostgreSQL
2. Restores from latest backup
3. Starts PostgreSQL
4. Shows verification steps

---

### Point-in-Time Recovery (PITR)
```bash
# Restore to specific time
make restore-pitr TIME="2024-10-04 15:30:00"

# Restore to 2 hours ago
make restore-pitr TIME="$(date -u -d '2 hours ago' '+%Y-%m-%d %H:%M:%S')"

# Restore to midnight today
make restore-pitr TIME="2024-10-04 00:00:00"
```

**Time format:** `YYYY-MM-DD HH:MM:SS` (UTC)

---

### Restore Specific Backup Set
```bash
# 1. List available backups
make backup-info

# 2. Restore specific set
make restore-specific SET="20241004-163303F"
```

---

## 🔍 Database Verification

```bash
# Open PostgreSQL shell
make db-shell

# Verify database contents
make db-verify

# Quick counts:
# - Users
# - Products  
# - Sales
# - Latest sale record
```

---

## 🛠️ Development Commands

```bash
make dev-logs          # Tail logs with last 100 lines
make dev-build         # Rebuild app without cache
make dev-restart-app   # Restart only app service
```

### Shell Access
```bash
make app-shell      # Application container shell
make postgres-shell # PostgreSQL container shell  
make backup-shell   # Backup container shell
make db-shell       # PostgreSQL database shell
```

---

## 🧪 Testing

```bash
make test-backup   # Create test backup
make test-health   # Test all health endpoints
```

---

## 📊 Information

```bash
make version   # Show version info
make ports     # Show exposed ports
make volumes   # Show Docker volumes
```

---

## 🔧 Maintenance

```bash
make update  # Update deployment (pull latest, recreate)
make clean   # Clean up unused Docker resources
make reset   # Complete reset (DESTRUCTIVE!)
```

---

## 🎯 Example Workflows

### Deploy New Instance
```bash
make setup
# Edit .env with your configuration
make deploy
make backup-info  # Verify backup system
```

### Daily Operations
```bash
make status        # Check everything is running
make logs          # Check for any errors
make backup        # Create manual backup
```

### Disaster Recovery
```bash
# On new server with same .env credentials
make deploy
make restore
make db-verify
```

### After Accidental Data Loss
```bash
# Find when error occurred
make backup-info

# Restore to just before error
make restore-pitr TIME="2024-10-04 14:30:00"

# Verify restoration
make db-verify
```

### Update Deployment
```bash
git pull
make update
make health
```

---

## ⚠️ Important Notes

### Restore Safety
- All restore commands include confirmation prompts
- Database is automatically stopped before restore
- Automatically restarted after restore
- **Always backup before major operations**

### Destructive Commands
```bash
make reset   # Requires typing 'reset' to confirm
make restore # Requires Enter to confirm
```

### Log Viewing
```bash
# All logs
make logs

# Specific service
make logs SERVICE=app
make logs SERVICE=postgres
make logs SERVICE=backup
make logs SERVICE=proxy
```

---

## 💡 Pro Tips

### Chain Commands
```bash
# Backup, update, verify
make backup && make update && make health

# Stop, update, start
make stop && git pull && make update
```

### Quick Checks
```bash
# One-liner health check
make health | grep healthy

# Quick backup verification  
make backup-check
```

### Backup Before Changes
```bash
# Always backup before major changes
make backup && make update
```

---

## 🆘 Troubleshooting

### Command Not Found
```bash
# Make sure you're in project root
cd /path/to/SaleSpider
make help
```

### Permission Errors
```bash
# Fix script permissions
make perms
```

### Restore Fails
```bash
# Check backup access
make backup-info

# Verify credentials in .env
cat .env | grep AWS_

# Check logs
make logs SERVICE=backup
```

---

## 📚 Additional Resources

- **Full Restore Guide**: `.docker/RESTORE_GUIDE.md`
- **Deployment README**: `.docker/README.md`
- **HTTPS Setup**: `.docker/HTTPS_SETUP.md`

---

## ✅ Quick Command Summary

| Task | Command |
|------|---------|
| **Deploy** | `make deploy` |
| **Start** | `make start` |
| **Stop** | `make stop` |
| **Status** | `make status` |
| **Logs** | `make logs` |
| **Backup** | `make backup` |
| **Restore Latest** | `make restore` |
| **Restore PITR** | `make restore-pitr TIME="..."` |
| **Verify DB** | `make db-verify` |
| **Update** | `make update` |
| **Help** | `make help` |
