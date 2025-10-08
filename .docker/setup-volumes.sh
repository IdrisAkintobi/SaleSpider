#!/bin/bash
# Setup script to create required volume directories for SaleSpider

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up SaleSpider volume directories...${NC}"

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from project root
if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
    echo -e "${GREEN}Loaded environment from $PROJECT_ROOT/.env${NC}"
elif [ -f .env ]; then
    set -a
    source .env
    set +a
    echo -e "${GREEN}Loaded environment from .env${NC}"
else
    echo -e "${YELLOW}Warning: .env file not found, using defaults${NC}"
fi

# Set default paths - resolve relative to .docker directory
DATA_PATH=${DATA_PATH:-./data}
BACKUP_PATH=${BACKUP_PATH:-./data/backups}

# Convert relative paths to absolute if needed
if [[ "$DATA_PATH" != /* ]]; then
    DATA_PATH="$SCRIPT_DIR/$DATA_PATH"
fi
if [[ "$BACKUP_PATH" != /* ]]; then
    BACKUP_PATH="$SCRIPT_DIR/$BACKUP_PATH"
fi

# Create directory structure
echo "Creating directory structure..."
echo "  Base path: ${DATA_PATH}"
echo "  Backup path: ${BACKUP_PATH}"
echo ""

# Database volumes
mkdir -p "${DATA_PATH}/postgres"
mkdir -p "${BACKUP_PATH}/postgres"

# Application volumes
mkdir -p "${DATA_PATH}/uploads"
mkdir -p "${DATA_PATH}/logs"
mkdir -p "${DATA_PATH}/logs/backup"

# SSL certificates
mkdir -p "${DATA_PATH}/ssl"

# Backup volumes
mkdir -p "${BACKUP_PATH}/pgBackRest"

echo -e "${GREEN}✓ Created all required directories${NC}"

# Set permissions
echo "Setting permissions..."
chmod -R 755 "${DATA_PATH}"
chmod -R 755 "${BACKUP_PATH}"

echo -e "${GREEN}✓ Permissions set${NC}"

# Display created directories
echo ""
echo "Created directories:"
echo "  - ${DATA_PATH}/postgres"
echo "  - ${DATA_PATH}/uploads"
echo "  - ${DATA_PATH}/logs"
echo "  - ${DATA_PATH}/logs/backup"
echo "  - ${DATA_PATH}/ssl"
echo "  - ${BACKUP_PATH}/postgres"
echo "  - ${BACKUP_PATH}/pgBackRest"

echo ""
echo -e "${GREEN}✓ Volume setup complete!${NC}"
echo "You can now run: docker compose up -d"
