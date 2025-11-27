# Self-Hosted Deployment

Deploy SaleSpider with a self-hosted PostgreSQL database using Docker Compose for complete control and offline capability.

## Overview

Self-hosted deployment includes:

- Application container
- PostgreSQL database container
- Caddy reverse proxy (optional)
- pgBackRest backup system
- Complete offline capability

## Prerequisites

- Docker and Docker Compose installed
- 2GB+ RAM available
- 10GB+ disk space
- Linux, macOS, or Windows with WSL2

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/IdrisAkintobi/SaleSpider.git
cd SaleSpider
```

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env` file:

```bash
# Database (auto-configured for Docker)
DATABASE_URL="postgresql://salespider:password@postgres:5432/salespider"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# AI Features (optional)
GOOGLE_GENAI_API_KEY="your-google-ai-api-key"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backup Configuration
PGBACKREST_REPO1_TYPE="posix"
PGBACKREST_REPO1_PATH="/var/lib/pgbackrest"
SETUP_BACKUP="true"
```

### 3. Start Services

```bash
# Using Make (recommended)
make docker-up

# Or using Docker Compose directly
docker-compose up -d
```

### 4. Initialize Database

```bash
# Run migrations and seed data
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run seed
```

### 5. Access Application

Open your browser to `http://localhost:3000`

Default credentials:

- Email: `admin@example.com`
- Password: `Admin123!`

## Architecture

```
┌─────────────────────────────────────────┐
│         Caddy (Reverse Proxy)           │
│         Port 80/443                     │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│   Next.js     │       │  PostgreSQL   │
│   Container   │◄──────┤   Container   │
│   Port 3000   │       │   Port 5432   │
└───────────────┘       └───────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
            ┌───────────────┐
            │  pgBackRest   │
            │   (Backup)    │
            └───────────────┘
```

## Docker Compose Configuration

### Basic Setup

The default `docker-compose.yml` includes:

```yaml
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=salespider
      - POSTGRES_USER=salespider
      - POSTGRES_PASSWORD=password
```

### With Backup System

For production with backups:

```bash
docker-compose -f docker-compose.yml -f .docker/compose/backup.yml up -d
```

### With Reverse Proxy

For HTTPS and custom domain:

```bash
docker-compose -f docker-compose.yml -f .docker/compose/proxy.yml up -d
```

## Management Commands

### Using Make

```bash
# Start services
make docker-up

# Stop services
make docker-down

# View logs
make docker-logs

# Restart services
make docker-restart

# Rebuild containers
make docker-build

# Create backup
make backup

# Restore backup
make restore
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build

# Execute commands in container
docker-compose exec app npm run seed
```

## Backup & Restore

### Automatic Backups

Backups run automatically when configured:

```bash
# In .env
SETUP_BACKUP="true"
PGBACKREST_REPO1_TYPE="posix"
PGBACKREST_REPO1_PATH="/var/lib/pgbackrest"
```

### Manual Backup

```bash
# Create full backup
make backup

# Or using Docker
docker-compose exec postgres pgbackrest backup --stanza=main --type=full
```

### Restore from Backup

```bash
# Restore latest backup
make restore

# Or using Docker
docker-compose exec postgres pgbackrest restore --stanza=main
```

[Learn more about backups →](/operations/backup-restore)

## Updating

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
make docker-build
make docker-restart

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Update Database

```bash
# Backup first!
make backup

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## Monitoring

### Check Service Status

```bash
# All services
docker-compose ps

# Specific service
docker-compose ps app
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check Docker status
docker ps -a

# Restart Docker daemon
sudo systemctl restart docker
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Verify connection string
docker-compose exec app env | grep DATABASE_URL
```

### Port Conflicts

If port 3000 is already in use:

```yaml
# In docker-compose.yml
services:
  app:
    ports:
      - '3001:3000' # Change external port
```

### Out of Disk Space

```bash
# Clean up Docker
docker system prune -a

# Remove old volumes
docker volume prune

# Check disk usage
df -h
```

## Security Considerations

### Production Checklist

Before going to production:

- ✅ Change default passwords
- ✅ Use strong JWT_SECRET (minimum 32 characters)
- ✅ Enable HTTPS with Caddy
- ✅ Configure firewall rules
- ✅ Set up regular backups
- ✅ Enable backup encryption
- ✅ Restrict database access
- ✅ Keep Docker images updated

### Network Security

```yaml
# In docker-compose.yml
services:
  postgres:
    networks:
      - internal
    # Don't expose port externally
    # ports:
    #   - "5432:5432"

networks:
  internal:
    internal: true
```

## Benefits

- ✅ **Complete Control** - Full access to all components
- ✅ **Offline Capable** - Works without internet
- ✅ **Data Privacy** - All data stays on your infrastructure
- ✅ **Customizable** - Modify any component
- ✅ **Cost Effective** - No recurring cloud costs

## Limitations

- ⚠️ **Maintenance Required** - You manage updates and backups
- ⚠️ **Infrastructure Needed** - Requires server hardware
- ⚠️ **Technical Knowledge** - Docker and Linux experience helpful

## Related Documentation

- [Hosted Database Deployment](/deployment/hosted-database)
- [Cloud Platforms](/deployment/cloud-platforms)
- [Backup & Restore](/operations/backup-restore)
- [Offline Operation](/deployment/offline)
- [Makefile Commands](/operations/makefile)
