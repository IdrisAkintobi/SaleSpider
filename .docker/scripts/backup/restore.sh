#!/bin/sh
set -e

# pgBackRest Restore Script
# This script restores the PostgreSQL database from pgBackRest backups

# Configuration
STANZA="salespider"
LOG_FILE="/var/log/pgbackrest/restore.log"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "========================================="
log "Starting pgBackRest restore process"
log "========================================="

# Parse command line arguments
RESTORE_TYPE="${1:-latest}"  # latest, pitr, or specific backup set
TARGET_TIME="${2:-}"         # For PITR: "2024-10-04 18:00:00"
BACKUP_SET="${3:-}"          # For specific backup: "20241004-163303F"

log "Restore type: $RESTORE_TYPE"

# Stop PostgreSQL if running
log "Stopping PostgreSQL service..."
if pg_isready -h postgres -p 5432 -U postgres 2>/dev/null; then
    log "WARNING: PostgreSQL is running. Please stop it before restoring."
    log "Run: docker compose -f .docker/docker-compose.yml stop postgres"
    exit 1
fi

# Verify backup repository is accessible
log "Verifying backup repository..."
if ! pgbackrest --stanza="$STANZA" info >/dev/null 2>&1; then
    log "ERROR: Cannot access backup repository"
    log "Please check your cloud storage credentials and network connectivity"
    exit 1
fi

# Show available backups
log "Available backups:"
pgbackrest --stanza="$STANZA" info

# Perform restore based on type
case "$RESTORE_TYPE" in
    latest)
        log "Restoring from latest backup..."
        pgbackrest --stanza="$STANZA" \
            --log-level-console=info \
            --log-level-file=debug \
            restore
        ;;
    
    pitr)
        if [ -z "$TARGET_TIME" ]; then
            log "ERROR: Target time required for PITR"
            log "Usage: restore.sh pitr '2024-10-04 18:00:00'"
            exit 1
        fi
        
        log "Restoring to point-in-time: $TARGET_TIME"
        pgbackrest --stanza="$STANZA" \
            --log-level-console=info \
            --log-level-file=debug \
            --type=time \
            --target="$TARGET_TIME" \
            --target-action=promote \
            restore
        ;;
    
    specific)
        if [ -z "$BACKUP_SET" ]; then
            log "ERROR: Backup set required"
            log "Usage: restore.sh specific <backup-set>"
            exit 1
        fi
        
        log "Restoring from backup set: $BACKUP_SET"
        pgbackrest --stanza="$STANZA" \
            --log-level-console=info \
            --log-level-file=debug \
            --set="$BACKUP_SET" \
            restore
        ;;
    
    *)
        log "ERROR: Invalid restore type: $RESTORE_TYPE"
        log "Valid types: latest, pitr, specific"
        exit 1
        ;;
esac

# Check restore status
if [ $? -eq 0 ]; then
    log "========================================="
    log "Restore completed successfully!"
    log "========================================="
    log ""
    log "Next steps:"
    log "1. Start PostgreSQL: docker compose -f .docker/docker-compose.yml start postgres"
    log "2. Verify database: docker exec salespider-postgres psql -U postgres -d salespider -c '\\dt'"
    log "3. Check application connectivity"
    exit 0
else
    log "ERROR: Restore failed"
    log "Check logs at: $LOG_FILE"
    exit 1
fi
