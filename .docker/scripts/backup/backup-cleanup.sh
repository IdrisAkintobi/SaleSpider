#!/bin/bash
# Backup cleanup script for SaleSpider using pgBackRest

set -e

# Configuration
LOG_FILE="/var/log/pgbackrest/backup-cleanup.log"
RETENTION_FULL="${BACKUP_RETENTION_FULL:-8}"
RETENTION_DIFF="${BACKUP_RETENTION_DIFF:-14}"
WEBHOOK_URL="${BACKUP_WEBHOOK_URL:-}"
STANZA="${PGBACKREST_STANZA:-salespider}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
    local exit_code=$?
    log "ERROR: Backup cleanup failed with exit code $exit_code"
    
    # Send notification if webhook is configured
    if [ -n "$WEBHOOK_URL" ]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"error\",\"type\":\"backup_cleanup\",\"message\":\"Backup cleanup failed\",\"exit_code\":$exit_code}" \
            >/dev/null 2>&1 || true
    fi
    
    exit $exit_code
}

trap handle_error ERR

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting pgBackRest backup cleanup..."
log "Retention policy: Keep $RETENTION_FULL full backups, $RETENTION_DIFF differential backups"

# List current backups before cleanup
log "Current backups before cleanup:"
pgbackrest --stanza=$STANZA info | tee -a "$LOG_FILE"

# Perform cleanup - pgBackRest handles retention automatically based on config
log "Executing expire..."
pgbackrest --stanza=$STANZA expire

log "Backup cleanup completed successfully"

# List remaining backups
log "Remaining backups after cleanup:"
pgbackrest --stanza=$STANZA info | tee -a "$LOG_FILE"

# Send success notification
if [ -n "$WEBHOOK_URL" ]; then
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"status\":\"success\",\"type\":\"backup_cleanup\",\"message\":\"Backup cleanup completed\",\"retention_full\":$RETENTION_FULL,\"retention_diff\":$RETENTION_DIFF}" \
        >/dev/null 2>&1 || true
fi


log "pgBackRest cleanup process completed successfully"
