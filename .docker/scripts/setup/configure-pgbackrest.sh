#!/bin/sh
# Centralized pgBackRest configuration generator
# Runs once in setup container, creates config for all services

set -e

echo "=== pgBackRest Configuration Generator ==="

# Create configuration directory structure
mkdir -p /pgbackrest-config/conf.d

# Copy base configuration
echo "Copying base configuration..."
cp /base-config/pgbackrest.conf /pgbackrest-config/pgbackrest.conf

# Generate dynamic repository configuration
echo "Generating dynamic repository configuration..."

REPO_TYPE="${PGBACKREST_REPO1_TYPE:-none}"
echo "Repository type: $REPO_TYPE"

if [ "$REPO_TYPE" = "none" ]; then
    echo "Backup disabled - skipping pgBackRest configuration"
    # Create minimal config that disables archiving
    cat > /pgbackrest-config/conf.d/repo.conf << EOF
# Backup disabled (dynamically generated)
# Generated at: $(date)

# No repository configuration - backups disabled
EOF
    exit 0
fi

cat > /pgbackrest-config/conf.d/repo.conf << EOF
# Repository Configuration (dynamically generated)
# Generated at: $(date)

[global]
repo1-type=$REPO_TYPE
repo1-path=${PGBACKREST_REPO1_PATH:-/var/lib/pgbackrest}
EOF

# S3 Configuration
if [ "$REPO_TYPE" = "s3" ]; then
    echo "Configuring S3 repository..."
    
    if [ -n "$PGBACKREST_REPO1_S3_BUCKET" ]; then
        echo "repo1-s3-bucket=$PGBACKREST_REPO1_S3_BUCKET" >> /pgbackrest-config/conf.d/repo.conf
    fi
    if [ -n "$PGBACKREST_REPO1_S3_REGION" ]; then
        echo "repo1-s3-region=$PGBACKREST_REPO1_S3_REGION" >> /pgbackrest-config/conf.d/repo.conf
    fi
    if [ -n "$PGBACKREST_REPO1_S3_ENDPOINT" ]; then
        echo "repo1-s3-endpoint=$PGBACKREST_REPO1_S3_ENDPOINT" >> /pgbackrest-config/conf.d/repo.conf
    fi
    if [ -n "$PGBACKREST_REPO1_S3_KEY" ]; then
        echo "repo1-s3-key=$PGBACKREST_REPO1_S3_KEY" >> /pgbackrest-config/conf.d/repo.conf
    fi
    if [ -n "$PGBACKREST_REPO1_S3_KEY_SECRET" ]; then
        echo "repo1-s3-key-secret=$PGBACKREST_REPO1_S3_KEY_SECRET" >> /pgbackrest-config/conf.d/repo.conf
    fi
fi

# Azure Configuration
if [ "$REPO_TYPE" = "azure" ]; then
    echo "Configuring Azure Blob repository..."
    
    if [ -n "$PGBACKREST_REPO1_AZURE_CONTAINER" ]; then
        echo "repo1-azure-container=$PGBACKREST_REPO1_AZURE_CONTAINER" >> /pgbackrest-config/conf.d/repo.conf
    fi
    if [ -n "$PGBACKREST_REPO1_AZURE_ACCOUNT" ]; then
        echo "repo1-azure-account=$PGBACKREST_REPO1_AZURE_ACCOUNT" >> /pgbackrest-config/conf.d/repo.conf
    fi
    if [ -n "$PGBACKREST_REPO1_AZURE_KEY" ]; then
        echo "repo1-azure-key=$PGBACKREST_REPO1_AZURE_KEY" >> /pgbackrest-config/conf.d/repo.conf
    fi
fi

# GCS Configuration
if [ "$REPO_TYPE" = "gcs" ]; then
    echo "Configuring Google Cloud Storage repository..."
    
    if [ -n "$PGBACKREST_REPO1_GCS_BUCKET" ]; then
        echo "repo1-gcs-bucket=$PGBACKREST_REPO1_GCS_BUCKET" >> /pgbackrest-config/conf.d/repo.conf
    fi
    if [ -n "$PGBACKREST_REPO1_GCS_KEY" ]; then
        echo "repo1-gcs-key=$PGBACKREST_REPO1_GCS_KEY" >> /pgbackrest-config/conf.d/repo.conf
    fi
fi

# Set proper permissions
chmod 644 /pgbackrest-config/pgbackrest.conf
chmod 644 /pgbackrest-config/conf.d/repo.conf

echo ""
echo "=== Configuration Generated Successfully ==="
echo ""
echo "Base configuration:"
cat /pgbackrest-config/pgbackrest.conf
echo ""
echo "Dynamic repository configuration:"
cat /pgbackrest-config/conf.d/repo.conf
echo ""
echo "Configuration will be available to all services via shared volume"
