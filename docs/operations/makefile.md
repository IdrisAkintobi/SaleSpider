# Makefile Commands

Quick reference for all available Make commands in SaleSpider.

## Overview

The Makefile provides convenient shortcuts for common operations. All commands should be run from the project root directory.

## Quick Reference

```bash
make help              # Show all available commands
make setup             # Initial project setup
make deploy            # Full deployment
make start             # Start services
make stop              # Stop services
make restart           # Restart services
make status            # Check service status
make logs              # View logs
make backup            # Create database backup
make restore           # Restore database
```

## Setup Commands

### Initial Setup

```bash
# Complete initial setup
make setup
```

Sets up:

- File permissions
- Environment configuration
- SSL certificates
- Docker volumes

### Permissions

```bash
# Fix script permissions
make perms
```

Makes all scripts executable.

## Deployment Commands

### Deploy

```bash
# Full deployment
make deploy
```

Performs:

- System checks
- SSL certificate generation
- Volume creation
- Service startup
- Database migrations
- Data seeding

### Update

```bash
# Update deployment
make update
```

Updates:

- Pull latest code
- Rebuild containers
- Run migrations
- Restart services

## Service Management

### Start Services

```bash
# Start all services
make start

# Or using Docker Compose
make docker-up
```

### Stop Services

```bash
# Stop all services
make stop

# Or using Docker Compose
make docker-down
```

### Restart Services

```bash
# Restart all services
make restart

# Restart specific service
docker-compose restart app
```

### Service Status

```bash
# Check service status
make status

# Detailed status
docker-compose ps
```

## Logging

### View Logs

```bash
# All services
make logs

# Specific service
make logs SERVICE=app
make logs SERVICE=postgres
make logs SERVICE=proxy
```

### Follow Logs

```bash
# Follow logs in real-time
docker-compose logs -f

# Follow specific service
docker-compose logs -f app
```

## Backup & Restore

### Create Backup

```bash
# Create full backup
make backup

# View backup info
make backup-info
```

### Restore Backup

```bash
# Restore latest backup
make restore

# Point-in-time restore
make restore-pitr TIME="2024-11-20 14:30:00"
```

## Database Operations

### Database Shell

```bash
# PostgreSQL shell
make db-shell

# Or directly
docker-compose exec postgres psql -U postgres -d salespider
```

### Run Migrations

```bash
# Run database migrations
docker-compose exec app npx prisma migrate deploy
```

### Seed Database

```bash
# Seed with sample data
docker-compose exec app npm run seed
```

## Docker Commands

### Build

```bash
# Build containers
make docker-build

# Rebuild without cache
docker-compose build --no-cache
```

### Clean

```bash
# Clean Docker resources
make docker-clean

# Remove volumes
docker-compose down -v
```

### Logs

```bash
# View Docker logs
make docker-logs

# Follow logs
make docker-logs-follow
```

## Application Commands

### Application Shell

```bash
# Access application container
make app-shell

# Or directly
docker-compose exec app sh
```

### Run Commands

```bash
# Run npm commands
docker-compose exec app npm run <command>

# Examples
docker-compose exec app npm test
docker-compose exec app npm run lint
```

## Health Checks

### System Health

```bash
# Check system health
make health

# Check specific service
docker-compose exec app curl http://localhost:3000/api/health
```

### Service Status

```bash
# Check all services
make status

# Check specific service
docker-compose ps app
```

## Maintenance

### Clean Up

```bash
# Clean Docker system
docker system prune -a

# Clean volumes
docker volume prune

# Clean images
docker image prune -a
```

### Update Dependencies

```bash
# Update npm packages
docker-compose exec app npm update

# Update Docker images
docker-compose pull
```

## Development

### Development Mode

```bash
# Start in development mode
docker-compose up

# With logs
docker-compose up --build
```

### Run Tests

```bash
# Run tests
docker-compose exec app npm test

# Run with coverage
docker-compose exec app npm run test:coverage
```

## Troubleshooting

### Reset Everything

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild and restart
make deploy
```

### Check Logs

```bash
# Check for errors
make logs | grep -i error

# Check specific service
make logs SERVICE=app | grep -i error
```

### Verify Configuration

```bash
# Show Docker Compose config
docker-compose config

# Check environment variables
docker-compose exec app env
```

## Custom Commands

### Add Custom Commands

Edit `Makefile` to add custom commands:

```makefile
.PHONY: my-command
my-command:
	@echo "Running my custom command"
	docker-compose exec app npm run my-script
```

Usage:

```bash
make my-command
```

## Environment-Specific

### Development

```bash
# Development setup
make setup
make deploy
```

### Production

```bash
# Production deployment
NODE_ENV=production make deploy
```

### Testing

```bash
# Run tests
make test

# Run specific tests
docker-compose exec app npm test -- --grep "pattern"
```

## Common Workflows

### Daily Operations

```bash
# Check status
make status

# View logs
make logs

# Create backup
make backup
```

### Deployment

```bash
# Initial deployment
make setup
make deploy

# Update deployment
git pull
make update
```

### Troubleshooting

```bash
# Check logs
make logs

# Restart services
make restart

# Check status
make status
```

## Tips

### Command Aliases

Add to your shell profile:

```bash
alias ss-start='make start'
alias ss-stop='make stop'
alias ss-logs='make logs'
alias ss-backup='make backup'
```

### Quick Access

```bash
# Jump to project directory
cd ~/SaleSpider

# Run command
make status
```

## Related Documentation

- [Self-Hosted Deployment](/deployment/self-hosted)
- [Backup & Restore](/operations/backup-restore)
- [Troubleshooting](/operations/troubleshooting)
- [Monitoring](/operations/monitoring)
