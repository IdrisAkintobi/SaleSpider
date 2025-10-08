#!/bin/bash
# Application setup script for SaleSpider

set -e

# Configuration from environment
APP_URL="${APP_URL:-https://localhost}"
SUPER_ADMIN_EMAIL="${SUPER_ADMIN_EMAIL:-admin@localhost}"
SUPER_ADMIN_PASSWORD="${SUPER_ADMIN_PASSWORD}"
SKIP_SEED="${SKIP_SEED:-false}"
FORCE_RESET="${FORCE_RESET:-false}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting application setup for SaleSpider"

# Wait for database setup to complete
log "Waiting for database setup to complete..."
max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if [ -f /logs/database-setup-completed ]; then
        log "Database setup completed"
        break
    fi
    
    attempt=$((attempt + 1))
    log "Attempt $attempt/$max_attempts: Waiting for database setup..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    log "WARNING: Database setup completion not detected, proceeding anyway..."
fi

# Wait for application to be ready
log "Waiting for application to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f "http://app:3000/api/health" >/dev/null 2>&1; then
        log "Application is ready"
        break
    fi
    
    attempt=$((attempt + 1))
    log "Attempt $attempt/$max_attempts: Application not ready, waiting..."
    sleep 5
done

if [ $attempt -eq $max_attempts ]; then
    log "WARNING: Application health check failed, but continuing setup..."
fi

# Check if we should skip seeding
if [ "$SKIP_SEED" = "true" ]; then
    log "Skipping database seeding (SKIP_SEED=true)"
else
    log "Checking if database needs seeding..."
    
    # Simple check to see if the database is already seeded
    # This would need to be adapted based on your actual schema
    seed_check_response=$(curl -s "http://app:3000/api/health" 2>/dev/null || echo "")
    
    if [ -n "$seed_check_response" ]; then
        log "Application is responding, assuming database is seeded"
    else
        log "Database appears to need seeding, but cannot verify application status"
    fi
fi

# Perform application-specific setup
log "Performing application-specific setup..."

# Create necessary directories
mkdir -p /logs/application

# Verify super admin credentials
log "Verifying super admin configuration..."
if [ -n "$SUPER_ADMIN_EMAIL" ] && [ -n "$SUPER_ADMIN_PASSWORD" ]; then
    log "Super admin configuration provided"
    log "Super admin account will be created by the Next.js application through Prisma seed scripts"
else
    log "ERROR: Super admin credentials are required but not provided"
    log "Please set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD environment variables"
    exit 1
fi

log "Application setup completed successfully"

# Create a marker file to indicate setup completion
touch /logs/application-setup-completed

log "Application setup script finished"
