#!/bin/bash
# SaleSpider Platform-Agnostic Deployment Script
# Works on Linux, macOS, Windows (with Git Bash/WSL)

set -e

# Script metadata
SCRIPT_VERSION="2.0.0"
APP_NAME="SaleSpider"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/.docker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${RED}❌ $1${NC}"
}

info() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] ${CYAN}📋 $1${NC}"
}

# Platform detection
detect_platform() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"  
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OS" == "Windows_NT" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Architecture detection
detect_architecture() {
    local arch=$(uname -m)
    case $arch in
        x86_64|amd64)
            echo "amd64"
            ;;
        aarch64|arm64)
            echo "arm64"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# Get host IP address
get_host_ip() {
    local platform=$(detect_platform)
    case $platform in
        "linux"|"macos")
            # Try multiple methods to get IP
            hostname -I 2>/dev/null | awk '{print $1}' || \
            ip route get 1 2>/dev/null | awk '{print $7}' || \
            ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -v 127.0.0.1 | head -1 | awk '{print $2}' | sed 's/addr://' || \
            echo "127.0.0.1"
            ;;
        "windows")
            # Windows IP detection
            ipconfig | grep "IPv4" | head -1 | awk '{print $NF}' | tr -d '\r' || echo "127.0.0.1"
            ;;
        *)
            echo "127.0.0.1"
            ;;
    esac
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    local platform=$(detect_platform)
    local architecture=$(detect_architecture)
    
    info "Platform: $platform"
    info "Architecture: $architecture"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker not found. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    local compose_cmd=""
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    elif docker-compose version &> /dev/null; then
        compose_cmd="docker-compose"
    else
        error "Docker Compose not found. Please update Docker."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check available disk space
    local available_space=$(df "$SCRIPT_DIR" | awk 'NR==2 {print $4}')
    if [[ "$available_space" -lt 2097152 ]]; then  # 2GB in KB
        warning "Low disk space detected. At least 2GB recommended."
    fi
    
    success "System requirements check passed"
    info "Docker Compose command: $compose_cmd"
    
    # Export for use in other functions
    export COMPOSE_CMD="$compose_cmd"
}

# Load environment configuration
load_environment() {
    log "Loading environment configuration..."
    
    # Check requirements first to set COMPOSE_CMD
    check_requirements
    
    # Load from .env file if it exists
    if [[ -f "$SCRIPT_DIR/.env" ]]; then
        log "Loading existing .env file..."
        set -a  # automatically export all variables
        source "$SCRIPT_DIR/.env"
        set +a
        success "Environment loaded from .env file"
    elif [[ -f "$SCRIPT_DIR/env.example" ]]; then
        log "Creating .env from example..."
        cp "$SCRIPT_DIR/env.example" "$SCRIPT_DIR/.env"
        warning "Please edit .env file with your configuration before proceeding"
        info "Key settings to configure:"
        info "  - DOMAIN (your domain name)"
        info "  - POSTGRES_PASSWORD (database password)"
        info "  - JWT_SECRET (application secret)"
        info "  - AWS credentials (for backup)"
        echo ""
        read -p "Press Enter to continue after editing .env file..."
    else
        error "No environment configuration found"
        exit 1
    fi
    
    # Set defaults and detect values
    export PLATFORM="${PLATFORM:-$(detect_platform)}"
    export ARCHITECTURE="${ARCHITECTURE:-$(detect_architecture)}"

    # Resolve HOST_IP if set to "auto" or empty
    if [[ -z "$HOST_IP" ]] || [[ "$HOST_IP" = "auto" ]]; then
        export HOST_IP="$(get_host_ip)"
        log "Auto-detected HOST_IP: $HOST_IP"
    fi

    export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-salespider}"
    export DATA_PATH="${DATA_PATH:-$SCRIPT_DIR/data}"
    export BACKUP_PATH="${BACKUP_PATH:-$SCRIPT_DIR/data/backups}"
    
    info "Configuration loaded:"
    info "  Platform: $PLATFORM"
    info "  Architecture: $ARCHITECTURE"
    info "  Host IP: $HOST_IP"
    info "  Domain: ${DOMAIN:-localhost}"
    info "  Data Path: $DATA_PATH"
}

# Setup directory structure
setup_directories() {
    log "Setting up directory structure..."
    
    # Create data directories
    mkdir -p "$DATA_PATH"/{postgres,uploads,logs,ssl}
    mkdir -p "$DATA_PATH/logs/backup"
    mkdir -p "$BACKUP_PATH"/{postgres,pgbackrest}
    
    # Set proper permissions
    chmod 755 "$DATA_PATH"
    chmod 700 "$DATA_PATH/ssl"
    
    success "Directory structure created"
}

# Generate secure secrets
generate_secrets() {
    log "Generating secure secrets..."
    
    # Generate JWT secret if not set
    if [[ -z "$JWT_SECRET" ]] || [[ "$JWT_SECRET" = "your-super-secret-jwt-key-min-32-characters-long" ]]; then
        export JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '\n')
        log "Generated new JWT secret"
    fi
    
    # Generate backup encryption key if not set
    if [[ -z "$BACKUP_ENCRYPTION_KEY" ]] || [[ "$BACKUP_ENCRYPTION_KEY" = "your-32-character-backup-encryption-key" ]]; then
        export BACKUP_ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '\n')
        log "Generated new backup encryption key"
    fi
    
    # Update .env file with generated secrets
    if [[ -f "$SCRIPT_DIR/.env" ]]; then
        # Update secrets in .env file
        sed -i.tmp "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" "$SCRIPT_DIR/.env"
        sed -i.tmp "s|BACKUP_ENCRYPTION_KEY=.*|BACKUP_ENCRYPTION_KEY=$BACKUP_ENCRYPTION_KEY|g" "$SCRIPT_DIR/.env"
        
        # Clean up temp files
        rm -f "$SCRIPT_DIR/.env.tmp"
        
        success "Secrets generated and saved to .env file"
    fi
}

# Validate configuration
validate_config() {
    log "Validating configuration..."
    
    local errors=0
    
    # Check required variables
    if [[ -z "$POSTGRES_PASSWORD" ]] || [[ "$POSTGRES_PASSWORD" = "SecurePostgresPassword123!" ]]; then
        error "POSTGRES_PASSWORD must be set to a secure password"
        errors=$((errors + 1))
    fi
    
    if [[ -z "$SUPER_ADMIN_EMAIL" ]]; then
        error "SUPER_ADMIN_EMAIL must be set"
        errors=$((errors + 1))
    fi

    if [[ -z "$SUPER_ADMIN_PASSWORD" ]] || [[ "$SUPER_ADMIN_PASSWORD" = "ChangeThisPassword123!" ]]; then
        error "SUPER_ADMIN_PASSWORD must be set to a secure password"
        errors=$((errors + 1))
    fi
    
    if [[ -z "$DOMAIN" ]] || [[ "$DOMAIN" = "salespider.local" ]]; then
        warning "DOMAIN is set to default value. Consider setting a custom domain."
    fi
    
    # Validate AWS configuration if backup is enabled
    if [[ "${BACKUP_REPO2_TYPE:-}" = "s3" ]] && { [[ -z "$AWS_ACCESS_KEY_ID" ]] || [[ -z "$AWS_SECRET_ACCESS_KEY" ]] || [[ -z "$AWS_S3_BUCKET" ]]; }; then
        warning "AWS S3 backup is configured but credentials are missing"
    fi
    
    if [[ $errors -gt 0 ]]; then
        error "Configuration validation failed with $errors errors"
        exit 1
    fi
    
    success "Configuration validation passed"
}

# Generate SSL certificates
generate_ssl_certificates() {
    log "Checking SSL certificates..."
    
    local ssl_dir="$DATA_PATH/ssl"
    
    # Check if certificates already exist
    if [[ -f "$ssl_dir/cert.pem" ]] && [[ -f "$ssl_dir/key.pem" ]]; then
        success "SSL certificates already exist"
        return 0
    fi
    
    log "Generating self-signed SSL certificates..."
    
    # Export environment variables for the SSL script
    export SSL_DIR="$ssl_dir"
    
    # Run the existing SSL generation script
    if [[ -f "$DOCKER_DIR/scripts/setup/setup-ssl.sh" ]]; then
        bash "$DOCKER_DIR/scripts/setup/setup-ssl.sh" || {
            error "Failed to generate SSL certificates"
            exit 1
        }
    else
        error "SSL generation script not found at $DOCKER_DIR/scripts/setup/setup-ssl.sh"
        exit 1
    fi
    
    success "SSL certificates generated successfully"
}

# Start services
start_services() {
    log "Starting SaleSpider services..."
    
    # Change to Docker directory
    cd "$DOCKER_DIR"
    
    # Create network if it doesn't exist
    if ! docker network ls | grep -q salespider-net; then
        log "Creating Docker network..."
        docker network create salespider-net --subnet=172.20.0.0/16 --gateway=172.20.0.1
    fi
    
    # Ensure directories exist before creating volumes
    setup_directories
    
    # Create only named Docker volumes (non-bind mount volumes)
    log "Creating Docker volumes..."
    docker volume create proxy-data || true
    docker volume create proxy-config || true
    docker volume create ssl-certs || true
    docker volume create pgbackrest-config || true
    
    # Start services
    log "Starting Docker services..."

    # Check if backup is enabled and set profiles accordingly
    local backup_type="${PGBACKREST_REPO1_TYPE:-}"
    local profiles=""

    # Only activate backup profile when type is set to: posix, s3, azure, or gcs
    if [[ -n "$backup_type" ]] && [[ "$backup_type" != "none" ]]; then
        case "$backup_type" in
            posix|s3|azure|gcs)
                profiles="--profile backup"
                success "Backup system enabled (type: $backup_type)"
                ;;
            *)
                warning "Invalid PGBACKREST_REPO1_TYPE: $backup_type"
                warning "Valid values: none, posix, s3, azure, gcs"
                warning "Backup service will not start"
                ;;
        esac
    else
        info "Backup system disabled"
        if [[ -z "$backup_type" ]] || [[ "$backup_type" = "none" ]]; then
            info "To enable backups, set PGBACKREST_REPO1_TYPE to: posix, s3, azure, or gcs"
            info "See BACKUP_GUIDE.md for configuration details"
        fi
    fi

    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" $profiles up -d
    
    # Wait for services to be healthy
    log "Waiting for services to become healthy..."
    local timeout=120  # 2 minutes
    local elapsed=0
    
    while [[ $elapsed -lt $timeout ]]; do
        # Count only running services with health checks (exclude setup and other one-time services)
        local running_services=$($COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" ps --format json 2>/dev/null | jq -r 'select(.State == "running") | .Name' | wc -l || echo "0")
        local healthy_services=$($COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" ps --format json 2>/dev/null | jq -r 'select(.Health == "healthy") | .Name' | wc -l || echo "0")
        
        # Check if we have running services and they are healthy
        if [[ "$running_services" -gt 0 ]] && [[ "$healthy_services" -ge 2 ]]; then
            success "Core services are healthy! (app, postgres)"
            break
        fi
        
        log "Waiting for services... (healthy: $healthy_services, elapsed: $elapsed/$timeout seconds)"
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    if [[ $elapsed -ge $timeout ]]; then
        warning "Some services may not be fully healthy yet"
        log "Check service status with: $0 status"
        log ""
        log "If setup is still running, this is normal. Core services should be ready."
    fi
}

# Show deployment information
show_deployment_info() {
    success "$APP_NAME deployment completed!"
    echo ""
    echo -e "🎉 ${GREEN}Deployment Summary${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "📱 ${CYAN}Access URLs:${NC}"
    echo "   • Local:   https://${DOMAIN:-localhost}"
    echo "   • Network: https://$HOST_IP"
    echo "   • Fallback: http://localhost:3000"
    echo ""
    echo -e "🔐 ${CYAN}Admin Account:${NC}"
    echo "   • Email:    ${SUPER_ADMIN_EMAIL:-admin@localhost}"
    echo "   • Password: [Set in environment]"
    echo ""
    echo -e "🗄️  ${CYAN}Database:${NC}"
    echo "   • Host: postgres (internal)"
    echo "   • Database: ${POSTGRES_DB:-salespider}"
    echo "   • User: ${POSTGRES_USER:-postgres}"
    echo ""
    echo -e "💾 ${CYAN}Data Storage:${NC}"
    echo "   • Application: $DATA_PATH"
    echo "   • Backups: $BACKUP_PATH"
    echo ""
    echo -e "🔧 ${CYAN}Management Commands:${NC}"
    echo "   • Status:  $0 status"
    echo "   • Logs:    $0 logs [service]"
    echo "   • Stop:    $0 stop"
    echo "   • Restart: $0 restart"
    echo "   • Backup:  $0 backup"
    echo ""
    echo -e "📋 ${CYAN}Next Steps:${NC}"
    echo "   1. Accept SSL certificate in browser"
    echo "   2. Log in with admin credentials"
    echo "   3. Configure application settings"
    echo "   4. Set up backup schedule"
    echo ""
    
    # Show service status
    echo -e "📊 ${CYAN}Service Status:${NC}"
    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" ps
}

# Stop services
stop_services() {
    log "Stopping $APP_NAME services..."
    
    # Stop all services including backup profile
    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" --profile backup down
    
    success "$APP_NAME stopped"
}

# Show status
show_status() {
    echo -e "📊 ${CYAN}$APP_NAME Status${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" ps
    
    echo ""
    echo -e "💾 ${CYAN}Storage Usage:${NC}"
    if [[ -d "$DATA_PATH" ]]; then
        du -sh "$DATA_PATH" 2>/dev/null || echo "Data directory not accessible"
    fi
    
    if [[ -d "$BACKUP_PATH" ]]; then
        du -sh "$BACKUP_PATH" 2>/dev/null || echo "Backup directory not accessible"
    fi
    
    echo ""
    echo -e "🌐 ${CYAN}Network Access:${NC}"
    echo "   • Local:   https://${DOMAIN:-localhost}"
    echo "   • Network: https://$HOST_IP"
}

# Show logs
show_logs() {
    local service="$1"
    
    if [[ -n "$service" ]]; then
        log "Showing logs for service: $service"
        $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" logs -f "$service"
    else
        log "Showing logs for all services"
        $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" logs -f
    fi
}

# Perform backup
perform_backup() {
    log "Performing manual backup..."
    
    # Check if backup service is running
    if ! $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" ps backup | grep -q "Up"; then
        error "Backup service is not running"
        exit 1
    fi
    
    # Trigger full backup
    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" exec backup /scripts/backup-full.sh
    
    success "Manual backup completed"
}

# Reset deployment (destructive)
reset_deployment() {
    echo -e "⚠️  ${RED}DESTRUCTIVE OPERATION${NC}"
    echo ""
    echo "This will permanently delete:"
    echo "   • All database data"
    echo "   • All uploaded files"
    echo "   • All backups"
    echo "   • All logs"
    echo "   • All SSL certificates"
    echo ""
    echo "Are you absolutely sure? Type 'DELETE' to confirm:"
    read -r confirmation
    
    if [[ "$confirmation" != "DELETE" ]]; then
        log "Reset cancelled"
        return 0
    fi
    
    log "Resetting $APP_NAME deployment..."
    
    # Stop services
    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" down -v --remove-orphans
    
    # Remove Docker resources
    docker system prune -f
    docker volume prune -f
    
    # Remove data directories
    rm -rf "$DATA_PATH" "$BACKUP_PATH"
    rm -rf "$DOCKER_DIR/logs" "$DOCKER_DIR/tmp"
    
    success "Reset completed"
}

# Update deployment
update_deployment() {
    log "Updating $APP_NAME deployment..."
    
    # Pull latest images
    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" pull
    
    # Restart services
    $COMPOSE_CMD -f "$DOCKER_DIR/docker-compose.yml" --env-file "$SCRIPT_DIR/.env" up -d --force-recreate
    
    success "Update completed"
}

# Show help
show_help() {
    echo -e "${PURPLE}SaleSpider Deployment Script v$SCRIPT_VERSION${NC}"
    echo ""
    echo "Platform-agnostic deployment script for SaleSpider"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  $0 [command] [options]"
    echo ""
    echo -e "${CYAN}Commands:${NC}"
    echo -e "  ${GREEN}deploy${NC}    - Deploy SaleSpider (default)"
    echo -e "  ${GREEN}start${NC}     - Start services"
    echo -e "  ${GREEN}stop${NC}      - Stop services"
    echo -e "  ${GREEN}restart${NC}   - Restart services"
    echo -e "  ${GREEN}status${NC}    - Show service status"
    echo -e "  ${GREEN}logs${NC}      - Show logs [service]"
    echo -e "  ${GREEN}backup${NC}    - Perform manual backup"
    echo -e "  ${GREEN}update${NC}    - Update deployment"
    echo -e "  ${GREEN}reset${NC}     - Reset deployment (destructive)"
    echo -e "  ${GREEN}help${NC}      - Show this help"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  $0 deploy         # Full deployment"
    echo "  $0 logs app       # Show application logs"
    echo "  $0 logs postgres  # Show database logs"
    echo "  $0 status         # Show service status"
    echo ""
    echo -e "${CYAN}Environment Variables:${NC}"
    echo -e "  ${YELLOW}DOMAIN${NC}           - Domain name (default: localhost)"
    echo -e "  ${YELLOW}DATA_PATH${NC}        - Data storage path"
    echo -e "  ${YELLOW}BACKUP_PATH${NC}      - Backup storage path"
    echo ""
    echo -e "${CYAN}Configuration:${NC}"
    echo "  Edit .env file to customize deployment settings"
    echo ""
}

# Main execution function
main() {
    local command="${1:-deploy}"
    
    case "$command" in
        "deploy"|"start")
            check_requirements
            load_environment
            generate_secrets
            validate_config
            setup_directories
            generate_ssl_certificates
            start_services
            show_deployment_info
            ;;
        "stop")
            check_requirements
            load_environment
            stop_services
            ;;
        "restart")
            load_environment
            stop_services
            sleep 3
            start_services
            show_deployment_info
            ;;
        "status")
            load_environment
            show_status
            ;;
        "logs")
            check_requirements
            load_environment
            show_logs "$2"
            ;;
        "backup")
            check_requirements
            load_environment
            perform_backup
            ;;
        "update")
            load_environment
            update_deployment
            ;;
        "reset")
            load_environment
            reset_deployment
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Trap signals for clean shutdown
trap 'echo ""; warning "Interrupted"; exit 1' INT TERM

# Run main function
main "$@"
