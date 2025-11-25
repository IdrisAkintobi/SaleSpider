#!/bin/bash
# Differential backup script for SaleSpider using pgBackRest

set -e

# Configuration
LOG_FILE="/var/log/pgbackrest/backup-diff.log"
WEBHOOK_URL="${BACKUP_WEBHOOK_URL:-}"
STANZA="${PGBACKREST_STANZA:-salespider}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Logging function
log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$msg"
    # Only use tee if log file is writable
    if [[ -w "$LOG_FILE" ]] || [[ -w "$(dirname "$LOG_FILE")" ]]; then
        echo "$msg" >> "$LOG_FILE" 2>/dev/null || true
    fi
    return 0
}

# Error handling
handle_error() {
    local exit_code=$?
    log "ERROR: Differential backup failed with exit code $exit_code"
    
    if [[ -n "$WEBHOOK_URL" ]]; then
        curl -s -X POST "$WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"error\",\"type\":\"backup\",\"message\":\"Differential backup failed\",\"exit_code\":$exit_code}" \
            >/dev/null 2>&1 || true
    fi
    
    exit $exit_code
}

trap handle_error ERR

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting pgBackRest differential backup..."

# Perform backup
log "Executing pgbackrest backup --type=diff..."
start_time=$(date +%s)

/usr/bin/pgbackrest --stanza=$STANZA --type=diff backup

end_time=$(date +%s)
duration=$((end_time - start_time))

log "Differential backup completed successfully in ${duration}s"

# Get backup info
backup_info=$(pgbackrest --stanza=$STANZA info --output=json 2>/dev/null | head -1 || echo "{}")

# Send success notification
if [[ -n "$WEBHOOK_URL" ]]; then
    curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"status\":\"success\",\"type\":\"backup\",\"message\":\"Differential backup completed\",\"duration\":$duration,\"stanza\":\"$STANZA\"}" \
        >/dev/null 2>&1 || true
fi


log "pgBackRest differential backup process completed successfully"
