#!/bin/sh
# pgBackRest backup service startup script for SaleSpider

set -e

echo "Starting pgBackRest backup service..."

# Create necessary directories with proper structure (as root)
echo "Creating backup directory structure..."
mkdir -p /var/lib/pgbackrest/archive \
         /var/lib/pgbackrest/backup \
         /var/log/pgbackrest \
         /var/spool/pgbackrest

# Set proper permissions and ownership for postgres user (UID 999)
echo "Setting permissions for postgres user (UID 999)..."
chown -R 999:999 /var/lib/pgbackrest \
                 /var/log/pgbackrest \
                 /var/spool/pgbackrest
chmod -R 775 /var/lib/pgbackrest
chmod -R 775 /var/spool/pgbackrest
chmod -R 755 /var/log/pgbackrest

# Install required packages (pgbackrest will create /etc/pgbackrest)
echo "Installing required packages..."
apk add --no-cache curl bash postgresql-client pgbackrest su-exec

# Remove the default config created by apk and use our mounted config
echo "Configuring pgBackRest from shared volume..."
rm -rf /etc/pgbackrest
ln -s /pgbackrest-config /etc/pgbackrest

# Create postgres user if it doesn't exist
if ! id -u postgres >/dev/null 2>&1; then
    addgroup -g 999 postgres
    adduser -D -u 999 -G postgres postgres
fi

# Verify configuration is available
if [ -f /etc/pgbackrest/pgbackrest.conf ]; then
    echo "Base configuration:"
    cat /etc/pgbackrest/pgbackrest.conf
else
    echo "ERROR: pgBackRest configuration not found!" >&2
    echo "Make sure setup service has run successfully." >&2
    exit 1
fi

if [ -f /etc/pgbackrest/conf.d/repo.conf ]; then
    echo ""
    echo "Repository configuration:"
    cat /etc/pgbackrest/conf.d/repo.conf
else
    echo "WARNING: Repository configuration not found, using defaults" >&2
fi

# Wait for PostgreSQL data directory to be available
echo "Waiting for PostgreSQL data directory..."
until [ -f /var/lib/postgresql/data/PG_VERSION ]; do
    echo "PostgreSQL data directory not ready - sleeping"
    sleep 5
done

echo "PostgreSQL data directory ready!"

# Copy backup scripts to writable location and set ownership
if [ -f /scripts/backup-full.sh ]; then
    cp /scripts/backup-full.sh /usr/local/bin/backup-full.sh
    chmod +x /usr/local/bin/backup-full.sh
    chown postgres:postgres /usr/local/bin/backup-full.sh
fi

if [ -f /scripts/backup-diff.sh ]; then
    cp /scripts/backup-diff.sh /usr/local/bin/backup-diff.sh
    chmod +x /usr/local/bin/backup-diff.sh
    chown postgres:postgres /usr/local/bin/backup-diff.sh
fi

if [ -f /scripts/backup-cleanup.sh ]; then
    cp /scripts/backup-cleanup.sh /usr/local/bin/backup-cleanup.sh
    chmod +x /usr/local/bin/backup-cleanup.sh
    chown postgres:postgres /usr/local/bin/backup-cleanup.sh
fi

# Wait for PostgreSQL to be fully ready (not in recovery mode)
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    # Check if database is ready and out of recovery mode
    if pg_isready -h postgres -U postgres >/dev/null 2>&1 && \
       psql -h postgres -U postgres -d postgres -tAc "SELECT pg_is_in_recovery();" 2>/dev/null | grep -q "f"; then
        echo "PostgreSQL is ready and out of recovery mode"
        break
    fi
    attempt=$((attempt + 1))
    echo "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
    sleep 2
done

# Create or upgrade stanza
echo "Initializing pgBackRest stanza..."

# Ensure archive directory exists with proper permissions before stanza creation
mkdir -p /var/lib/pgbackrest/archive/salespider
mkdir -p /var/lib/pgbackrest/backup/salespider
chown -R 999:999 /var/lib/pgbackrest
chmod -R 775 /var/lib/pgbackrest

# From here on, run pgbackrest commands as postgres user (UID 999)
echo "Switching to postgres user for pgBackRest operations..."

# First, try to upgrade existing stanza (in case of restart)
if su-exec postgres pgbackrest --stanza=salespider stanza-upgrade 2>/dev/null; then
    echo "Stanza upgraded successfully"
elif su-exec postgres pgbackrest --stanza=salespider stanza-create 2>&1 | tee /tmp/stanza-create.log; then
    echo "Stanza created successfully"
else
    # Check if it already exists
    if su-exec postgres pgbackrest --stanza=salespider info >/dev/null 2>&1; then
        echo "Stanza already exists and is valid"
    else
        echo "ERROR: Failed to create stanza" >&2
        cat /tmp/stanza-create.log >&2
        echo "Attempting to retry stanza creation..." >&2
        if su-exec postgres pgbackrest --stanza=salespider stanza-create 2>&1; then
            echo "Stanza created successfully on retry"
        else
            echo "ERROR: Still failed to create stanza - continuing anyway" >&2
        fi
    fi
fi

# Verify stanza is accessible
echo "Verifying stanza..."
if su-exec postgres pgbackrest --stanza=salespider info; then
    echo "Stanza verification successful"
else
    echo "WARNING: Stanza verification failed - backups may not work until this is resolved" >&2
fi

# Setup cron jobs for automated backups (run as postgres user)
echo "Setting up backup schedule..."
mkdir -p /etc/crontabs
echo "# pgBackRest Backup Schedule" > /etc/crontabs/postgres
echo "$BACKUP_SCHEDULE_FULL su-exec postgres /usr/local/bin/backup-full.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/postgres
echo "${BACKUP_SCHEDULE_DIFF:-0 2 * * 1-6} su-exec postgres /usr/local/bin/backup-diff.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/postgres
echo "0 3 * * * su-exec postgres /usr/local/bin/backup-cleanup.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/postgres
chown postgres:postgres /etc/crontabs/postgres

# Start cron daemon
echo "Starting cron daemon..."
crond -f &

# Perform initial backup (as postgres user)
echo "Performing initial backup..."
sleep 2
if [ -f /usr/local/bin/backup-full.sh ]; then
    su-exec postgres /usr/local/bin/backup-full.sh || echo "Initial backup failed (will retry on schedule)"
fi

# Keep container running and show logs
echo "pgBackRest backup service started successfully"
tail -f /var/log/pgbackrest/*.log 2>/dev/null || tail -f /dev/null
