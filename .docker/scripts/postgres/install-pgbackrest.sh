#!/bin/bash
# Install and configure pgBackRest in PostgreSQL container
# This script runs during container initialization

set -e

echo "Configuring pgBackRest in PostgreSQL container..."

# Create necessary directories
mkdir -p /var/lib/pgbackrest/archive \
         /var/lib/pgbackrest/backup \
         /var/log/pgbackrest \
         /var/spool/pgbackrest

# Set permissions
chown -R postgres:postgres /var/lib/pgbackrest \
                           /var/log/pgbackrest \
                           /var/spool/pgbackrest
chmod -R 750 /var/lib/pgbackrest
chmod -R 750 /var/spool/pgbackrest
chmod -R 750 /var/log/pgbackrest

# Link our mounted config to /etc/pgbackrest
echo "Linking pgBackRest configuration from shared volume..."
if [[ -e /etc/pgbackrest ]] && [[ ! -L /etc/pgbackrest ]]; then
    rm -rf /etc/pgbackrest 2>/dev/null || mkdir -p /pgbackrest-config
fi
if [[ ! -e /etc/pgbackrest ]]; then
    ln -s /pgbackrest-config /etc/pgbackrest
fi

# Check if backups are disabled
if [[ "${PGBACKREST_REPO1_TYPE:-none}" = "none" ]]; then
    echo "Backups disabled - updating PostgreSQL configuration to disable archiving"
    sed -i "s/archive_mode = on/archive_mode = off/" /var/lib/postgresql/data/postgresql.conf
    sed -i "s/archive_command = .*/archive_command = ''/" /var/lib/postgresql/data/postgresql.conf
    echo "PostgreSQL archiving disabled"
else
    echo "Setting up pgBackRest backup system..."
    
    # Copy backup scripts to container
    if [[ -d /backup-scripts ]]; then
        cp /backup-scripts/*.sh /usr/local/bin/ 2>/dev/null || true
        chmod +x /usr/local/bin/backup-*.sh 2>/dev/null || true
        chown postgres:postgres /usr/local/bin/backup-*.sh 2>/dev/null || true
        echo "Backup scripts installed"
    fi
    
    echo "pgBackRest will be configured after PostgreSQL starts"
    echo "Backups can be run manually with: docker exec postgres gosu postgres pgbackrest --stanza=salespider backup --type=full"
fi

echo "pgBackRest setup finished!"
