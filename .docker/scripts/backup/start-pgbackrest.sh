#!/bin/sh
# pgBackRest backup service startup script for SaleSpider

set -e

echo "Starting pgBackRest backup service..."

# Create necessary directories with proper structure
echo "Creating backup directory structure..."
mkdir -p /var/lib/pgbackrest/archive/salespider \
         /var/lib/pgbackrest/backup/salespider \
         /var/log/pgbackrest \
         /var/spool/pgbackrest

# Set proper permissions for cross-container access
# PostgreSQL runs as UID 999 (postgres), backup runs as root
# Use 777 for shared directories so both can read/write
echo "Setting permissions for cross-container access..."
chmod -R 777 /var/lib/pgbackrest
chmod -R 777 /var/spool/pgbackrest
chmod -R 755 /var/log/pgbackrest

# Install required packages (pgbackrest will create /etc/pgbackrest)
echo "Installing required packages..."
apk add --no-cache curl bash postgresql-client pgbackrest

# Remove the default config created by apk and use our mounted config
echo "Configuring pgBackRest from shared volume..."
rm -rf /etc/pgbackrest
ln -s /pgbackrest-config /etc/pgbackrest

# Verify configuration is available
if [ -f /etc/pgbackrest/pgbackrest.conf ]; then
    echo "Base configuration:"
    cat /etc/pgbackrest/pgbackrest.conf
else
    echo "ERROR: pgBackRest configuration not found!"
    echo "Make sure setup service has run successfully."
    exit 1
fi

if [ -f /etc/pgbackrest/conf.d/repo.conf ]; then
    echo ""
    echo "Repository configuration:"
    cat /etc/pgbackrest/conf.d/repo.conf
else
    echo "WARNING: Repository configuration not found, using defaults"
fi

# Wait for PostgreSQL data directory to be available
echo "Waiting for PostgreSQL data directory..."
until [ -f /var/lib/postgresql/data/PG_VERSION ]; do
    echo "PostgreSQL data directory not ready - sleeping"
    sleep 5
done

echo "PostgreSQL data directory ready!"

# Copy backup scripts to writable location
if [ -f /scripts/backup-full.sh ]; then
    cp /scripts/backup-full.sh /usr/local/bin/backup-full.sh
    chmod +x /usr/local/bin/backup-full.sh
fi

if [ -f /scripts/backup-diff.sh ]; then
    cp /scripts/backup-diff.sh /usr/local/bin/backup-diff.sh
    chmod +x /usr/local/bin/backup-diff.sh
fi

if [ -f /scripts/backup-cleanup.sh ]; then
    cp /scripts/backup-cleanup.sh /usr/local/bin/backup-cleanup.sh
    chmod +x /usr/local/bin/backup-cleanup.sh
fi

# Wait for PostgreSQL to be fully ready (not in recovery mode)
echo "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if pg_isready -h postgres -U postgres >/dev/null 2>&1; then
        # Check if database is out of recovery mode
        if psql -h postgres -U postgres -d postgres -tAc "SELECT pg_is_in_recovery();" 2>/dev/null | grep -q "f"; then
            echo "PostgreSQL is ready and out of recovery mode"
            break
        fi
    fi
    attempt=$((attempt + 1))
    echo "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
    sleep 2
done

# Create stanza
echo "Creating pgBackRest stanza..."
if pgbackrest --stanza=salespider stanza-create; then
    echo "Stanza created successfully"
else
    echo "WARNING: Stanza creation failed (may already exist or will retry later)"
fi

# Setup cron jobs for automated backups
echo "Setting up backup schedule..."
mkdir -p /etc/crontabs
echo "# pgBackRest Backup Schedule" > /etc/crontabs/root
echo "$BACKUP_SCHEDULE_FULL /usr/local/bin/backup-full.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/root
echo "${BACKUP_SCHEDULE_DIFF:-0 2 * * 1-6} /usr/local/bin/backup-diff.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/root
echo "0 3 * * * /usr/local/bin/backup-cleanup.sh >> /var/log/pgbackrest/cron.log 2>&1" >> /etc/crontabs/root

# Start cron daemon
echo "Starting cron daemon..."
crond -f &

# Perform initial backup
echo "Performing initial backup..."
sleep 2
if [ -f /usr/local/bin/backup-full.sh ]; then
    /usr/local/bin/backup-full.sh || echo "Initial backup failed (will retry on schedule)"
fi

# Keep container running and show logs
echo "pgBackRest backup service started successfully"
tail -f /var/log/pgbackrest/*.log 2>/dev/null || tail -f /dev/null
