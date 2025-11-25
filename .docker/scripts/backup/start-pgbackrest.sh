#!/bin/sh
# pgBackRest backup service startup script

set -e

echo "Starting pgBackRest backup service..."

# Create postgres user (Alpine has ping group with GID 999)
if ! getent passwd postgres >/dev/null 2>&1; then
    adduser -D -u 999 -G ping postgres 2>/dev/null || true
    echo "Created postgres user (UID 999) in ping group (GID 999)"
fi

# Create necessary directories
echo "Creating backup directory structure..."
mkdir -p /var/lib/pgbackrest/archive/salespider \
         /var/lib/pgbackrest/backup/salespider \
         /var/log/pgbackrest \
         /var/spool/pgbackrest

# Set proper permissions and ownership
echo "Setting permissions for postgres user (UID 999)..."
chown -R 999:999 /var/lib/pgbackrest \
                 /var/log/pgbackrest \
                 /var/spool/pgbackrest
chmod -R 777 /var/lib/pgbackrest
chmod -R 777 /var/spool/pgbackrest
chmod -R 777 /var/log/pgbackrest

# Pre-create log files
touch /var/log/pgbackrest/backup-full.log \
      /var/log/pgbackrest/backup-diff.log \
      /var/log/pgbackrest/backup-cleanup.log \
      /var/log/pgbackrest/cron.log
chown 999:999 /var/log/pgbackrest/*.log
chmod 666 /var/log/pgbackrest/*.log

# Install required packages
echo "Installing required packages..."
apk add --no-cache curl bash postgresql-client pgbackrest su-exec

# Remove default config and use mounted config
echo "Configuring pgBackRest from shared volume..."
rm -rf /etc/pgbackrest
ln -s /pgbackrest-config /etc/pgbackrest

# Verify configuration
if [ -f "/etc/pgbackrest/pgbackrest.conf" ]; then
    echo "Base configuration:"
    cat /etc/pgbackrest/pgbackrest.conf
else
    echo "ERROR: pgBackRest configuration not found!" >&2
    exit 1
fi

# Copy backup scripts
if [ -f "/scripts/backup-full.sh" ]; then
    cp /scripts/backup-full.sh /usr/local/bin/backup-full.sh
    chmod +x /usr/local/bin/backup-full.sh
    chown postgres:postgres /usr/local/bin/backup-full.sh
fi

if [ -f "/scripts/backup-diff.sh" ]; then
    cp /scripts/backup-diff.sh /usr/local/bin/backup-diff.sh
    chmod +x /usr/local/bin/backup-diff.sh
    chown postgres:postgres /usr/local/bin/backup-diff.sh
fi

if [ -f "/scripts/backup-cleanup.sh" ]; then
    cp /scripts/backup-cleanup.sh /usr/local/bin/backup-cleanup.sh
    chmod +x /usr/local/bin/backup-cleanup.sh
    chown postgres:postgres /usr/local/bin/backup-cleanup.sh
fi

# Wait for PostgreSQL
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if pg_isready -h postgres -U postgres >/dev/null 2>&1 && \
       psql -h postgres -U postgres -d postgres -tAc "SELECT pg_is_in_recovery();" 2>/dev/null | grep -q "f"; then
        echo "PostgreSQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
    sleep 2
done

# Create or upgrade stanza
echo "Initializing pgBackRest stanza..."

# Check if stanza already exists
if [ -f "/var/lib/pgbackrest/backup/salespider/backup.info" ]; then
    echo "Stanza exists, attempting upgrade..."
    su-exec postgres pgbackrest --stanza=salespider stanza-upgrade 2>&1 || echo "Upgrade not needed"
else
    echo "Creating new stanza..."
    su-exec postgres pgbackrest --stanza=salespider stanza-create 2>&1
    
    # Set permissions after stanza creation for cross-container access
    echo "Setting cross-container permissions..."
    chmod -R 777 /var/lib/pgbackrest/archive
    chmod -R 777 /var/lib/pgbackrest/backup
    chmod -R 777 /var/spool/pgbackrest
    echo "✓ Stanza created successfully"
fi

# Verify stanza
echo "Verifying stanza..."
su-exec postgres pgbackrest --stanza=salespider info || echo "Stanza will be ready after first backup"

# Setup cron jobs
echo "Setting up backup schedule..."
mkdir -p /etc/crontabs
echo "# pgBackRest Backup Schedule" > /etc/crontabs/root
echo "$BACKUP_SCHEDULE_FULL su-exec postgres /usr/local/bin/backup-full.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/root
echo "${BACKUP_SCHEDULE_DIFF:-0 2 * * 1-6} su-exec postgres /usr/local/bin/backup-diff.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/root
echo "0 3 * * * su-exec postgres /usr/local/bin/backup-cleanup.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/root

# Start cron daemon
echo "Starting cron daemon..."
crond -f &

# Perform initial backup
echo "Performing initial backup..."
sleep 2
if [ -f "/usr/local/bin/backup-full.sh" ]; then
    su-exec postgres /usr/local/bin/backup-full.sh || echo "Initial backup failed (will retry on schedule)"
fi

# Keep container running and show logs
echo "pgBackRest backup service started successfully"
tail -f /var/log/pgbackrest/*.log 2>/dev/null || tail -f /dev/null
