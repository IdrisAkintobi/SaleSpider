#!/bin/bash
# Database setup script for SaleSpider

set -e

# Configuration from environment
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-salespider}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting database setup for SaleSpider"

# Wait for PostgreSQL to be ready
log "Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" >/dev/null 2>&1; then
        log "PostgreSQL is ready"
        break
    fi
    
    attempt=$((attempt + 1))
    log "Attempt $attempt/$max_attempts: PostgreSQL not ready, waiting..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    log "ERROR: PostgreSQL failed to become ready after $max_attempts attempts"
    exit 1
fi

# Set PGPASSWORD for subsequent commands
export PGPASSWORD="$POSTGRES_PASSWORD"

# Check if database exists
log "Checking if database '$POSTGRES_DB' exists..."
if psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
    log "Database '$POSTGRES_DB' already exists"
else
    log "Creating database '$POSTGRES_DB'..."
    createdb -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" "$POSTGRES_DB"
    log "Database '$POSTGRES_DB' created successfully"
fi

# Test database connection
log "Testing database connection..."
if psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1;" >/dev/null 2>&1; then
    log "Database connection test successful"
else
    log "ERROR: Database connection test failed"
    exit 1
fi

# Create extensions if needed
log "Creating required extensions..."
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
    CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
    CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";
" >/dev/null 2>&1 || log "WARNING: Some extensions could not be created (this may be normal)"

# Set up database configuration
log "Configuring database settings..."
psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "
    -- Set timezone
    SET timezone = 'UTC';
    
    -- Configure logging
    ALTER SYSTEM SET log_statement = 'none';
    ALTER SYSTEM SET log_min_duration_statement = 1000;
    
    -- Reload configuration
    SELECT pg_reload_conf();
" >/dev/null 2>&1 || log "WARNING: Some database settings could not be applied"

log "Database setup completed successfully"

# Create a marker file to indicate setup completion
touch /logs/database-setup-completed

log "Database setup script finished"
