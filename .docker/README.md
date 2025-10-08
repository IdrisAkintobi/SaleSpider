# SaleSpider Docker Deployment

This directory contains the complete Docker-based deployment configuration for SaleSpider, designed to be platform-agnostic and production-ready.

## 🏗️ Architecture Overview

### Directory Structure
```
.docker/
├── docker-compose.yml          # Main compose configuration
├── compose/                    # Individual service definitions
│   ├── app.yml                # Next.js application
│   ├── postgres.yml           # PostgreSQL database
│   ├── proxy.yml              # Caddy reverse proxy
│   ├── backup.yml             # WAL-G backup system
│   └── setup.yml              # Initialization services
├── config/                    # Configuration files
│   ├── proxy/Caddyfile        # Caddy configuration
│   ├── postgres/              # PostgreSQL configuration
│   └── backup/                # Backup configuration
├── scripts/                   # Deployment scripts
│   ├── setup/                 # Initialization scripts
│   └── backup/                # Backup scripts
└── env.example (root)         # Environment template
```

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+ with Docker Compose
- 4GB+ RAM available
- 10GB+ disk space
- Internet connection (for initial setup)

### 1. Initial Setup
```bash
# Copy environment template
cp env.example .env

# Edit configuration (required)
nano .env
```

### 2. Configure Key Settings
Edit `.env` file with your settings:
```bash
# Domain and Network
DOMAIN=your-domain.com
HOST_IP=auto

# Security (REQUIRED - change these!)
POSTGRES_PASSWORD=YourSecurePassword123!
SUPER_ADMIN_PASSWORD=YourAdminPassword123!
JWT_SECRET=your-32-character-jwt-secret-here
NEXTAUTH_SECRET=your-32-character-nextauth-secret

# AWS S3 Backup (optional)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-backup-bucket
```

### 3. Setup Volume Directories
```bash
# Create required directories for Docker volumes
./.docker/setup-volumes.sh
```

### 4. Deploy
```bash
# Start all services (from project root)
docker compose -f .docker/docker-compose.yml --env-file .env up -d

# Check status
docker compose -f .docker/docker-compose.yml ps

# View logs
docker compose -f .docker/docker-compose.yml logs -f app
```

**Note**: Always run `docker compose` from the **project root** directory, not from `.docker/`. The `.env` file must be in the project root.

## 🔧 Configuration

### Environment Variables

#### Required Settings
- `POSTGRES_PASSWORD` - Database password (change from default!)
- `SUPER_ADMIN_PASSWORD` - Admin account password
- `JWT_SECRET` - Application JWT secret (32+ characters)
- `NEXTAUTH_SECRET` - NextAuth secret (32+ characters)

#### Network Settings
- `DOMAIN` - Your domain name (default: localhost)
- `HOST_IP` - Host IP address (auto-detected)
- `HTTP_PORT` - HTTP port (default: 80)
- `HTTPS_PORT` - HTTPS port (default: 443)

#### Storage Settings
- `DATA_PATH` - Application data storage (default: ./data)
- `BACKUP_PATH` - Backup storage location (default: ./data/backups)

#### Backup Settings
- `AWS_S3_BUCKET` - S3 bucket for cloud backups
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `BACKUP_ENCRYPTION_KEY` - Backup encryption key

### SSL/HTTPS Configuration

The system automatically generates self-signed certificates for development. For production:

1. **Let's Encrypt (Recommended)**
   - Set `DOMAIN` to your real domain
   - Caddy will automatically obtain certificates

2. **Custom Certificates**
   - Place certificates in `data/ssl/`
   - Update Caddyfile configuration

### Database Configuration

PostgreSQL is configured with:
- **Performance tuning** for typical workloads
- **WAL archiving** for point-in-time recovery
- **Connection pooling** and optimization
- **Automated backups** with WAL-G

## 📦 Services

### Application (app)
- **Next.js application** with SaleSpider
- **Prisma ORM** with automatic migrations
- **Health checks** and monitoring
- **Resource limits** and optimization

### Database (postgres)
- **PostgreSQL 16** with Alpine Linux
- **Performance tuning** for production
- **WAL archiving** for backup
- **Health monitoring**

### Proxy (proxy)
- **Caddy 2** reverse proxy
- **Automatic HTTPS** with Let's Encrypt
- **Rate limiting** and security headers
- **Load balancing** ready

### Backup (backup)
- **pgBackRest** for PostgreSQL backups
- **Cloud storage** support (S3, GCS, Azure)
- **Automated scheduling** with cron
- **Compression** with LZ4
- **Point-in-time recovery** support

## 🔄 Management Commands

### Deployment Management
```bash
./deploy.sh deploy    # Full deployment
./deploy.sh start     # Start services
./deploy.sh stop      # Stop services
./deploy.sh restart   # Restart services
./deploy.sh status    # Show status
```

### Logs and Monitoring
```bash
./deploy.sh logs              # All service logs
./deploy.sh logs app          # Application logs
./deploy.sh logs postgres     # Database logs
./deploy.sh logs proxy        # Proxy logs
./deploy.sh logs backup       # Backup logs
```

### Backup Management
```bash
./deploy.sh backup            # Manual backup
```

### Maintenance
```bash
./deploy.sh update            # Update deployment
./deploy.sh reset             # Reset (destructive!)
```

## 💾 Backup System

### Automated Backups
- **Full backups**: Weekly (Sundays at 2 AM)
- **Differential backups**: Daily (Mon-Sat at 2 AM)
- **Incremental backups**: Every 6 hours
- **Retention**: 7 full, 3 differential, 1 incremental

### Manual Backups
```bash
# Trigger manual backup
./deploy.sh backup

# Or directly via Docker
docker compose exec backup /scripts/backup-full.sh
```

### Backup Locations
1. **Local storage**: `/data/backups/pgBackRest`
2. **Cloud storage**: AWS S3, Google Cloud Storage, or Azure Blob (if configured)
3. **WAL archives**: Stored alongside backups

### Restore Process
```bash
# Stop application
./deploy.sh stop

# Restore from backup (example)
docker compose run --rm backup wal-g backup-fetch /var/lib/postgresql/data LATEST

# Start application
./deploy.sh start
```

## 🔒 Security

### SSL/TLS
- **Automatic HTTPS** with Let's Encrypt
- **Self-signed certificates** for development
- **Security headers** (HSTS, CSP, etc.)
- **Certificate management** and renewal

### Database Security
- **Password authentication** required
- **Network isolation** via Docker networks
- **Encrypted backups** with AES-256
- **Connection limits** and timeouts

### Application Security
- **JWT authentication** with secure secrets
- **Role-based access control** (RBAC)
- **Input validation** and sanitization
- **Audit logging** for compliance

## 📊 Monitoring

### Health Checks
- **Application**: `/api/health` endpoint
- **Database**: Connection and query tests
- **Proxy**: Configuration validation
- **Backup**: Backup integrity checks

### Alerting
Configure webhooks for notifications:
```bash
# Slack webhook
BACKUP_SLACK_WEBHOOK=https://hooks.slack.com/...

# Generic webhook
BACKUP_WEBHOOK_URL=https://your-monitoring-system/webhook

# Email alerts
BACKUP_EMAIL_ALERTS=true
ALERT_EMAIL=admin@your-domain.com
```

### Metrics
- **Service status** via Docker health checks
- **Backup status** via monitoring scripts
- **Storage usage** tracking
- **Performance metrics** (optional)

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check logs
./deploy.sh logs

# Check Docker
docker system df
docker system prune

# Restart Docker daemon
sudo systemctl restart docker  # Linux
# or restart Docker Desktop
```

#### Database Connection Issues
```bash
# Check database logs
./deploy.sh logs postgres

# Test connection
docker compose exec postgres pg_isready -U postgres

# Reset database (destructive!)
./deploy.sh reset
```

#### SSL Certificate Issues
```bash
# Check Caddy logs
./deploy.sh logs proxy

# Reload Caddy configuration (regenerates certificates if needed)
docker compose exec proxy caddy reload --config /etc/caddy/Caddyfile
```

#### Backup Failures
```bash
# Check backup logs
./deploy.sh logs backup

# Manual backup test
docker compose exec backup /scripts/backup-full.sh

# Check backup status
docker compose exec backup wal-g backup-list
```

### Performance Tuning

#### Database Performance
Edit `.env` file:
```bash
# Increase memory allocation
POSTGRES_SHARED_BUFFERS=512MB
POSTGRES_EFFECTIVE_CACHE_SIZE=2GB
POSTGRES_WORK_MEM=8MB
POSTGRES_MAX_CONNECTIONS=200
```

#### Application Performance
```bash
# Increase application resources
APP_MEMORY_LIMIT=4G
APP_CPU_LIMIT=4.0
APP_MEMORY_RESERVATION=2G
```

## 🌐 Network Access

### Local Access
- **HTTPS**: `https://localhost` or `https://your-domain`
- **HTTP**: `http://localhost:3000` (fallback)

### Network Access
- **HTTPS**: `https://your-server-ip`
- **Configure DNS**: Point domain to server IP
- **Firewall**: Open ports 80 and 443

### Mobile/Remote Access
1. **Trust SSL certificate** on devices
2. **Configure router DNS** (optional)
3. **Use VPN** for secure remote access

## 📋 Production Checklist

### Before Deployment
- [ ] Change all default passwords
- [ ] Configure domain name
- [ ] Set up SSL certificates
- [ ] Configure backup storage
- [ ] Test network connectivity
- [ ] Review security settings

### After Deployment
- [ ] Verify all services are healthy
- [ ] Test application functionality
- [ ] Confirm backup system works
- [ ] Set up monitoring/alerting
- [ ] Document access credentials
- [ ] Train users on system

### Ongoing Maintenance
- [ ] Monitor service health
- [ ] Review backup status
- [ ] Update system regularly
- [ ] Monitor storage usage
- [ ] Review security logs
- [ ] Test disaster recovery

## 🆘 Support

### Getting Help
1. **Check logs**: `./deploy.sh logs`
2. **Review documentation**: This README
3. **Check configuration**: Verify `.env` settings
4. **Test components**: Individual service tests
5. **Community support**: GitHub issues

### Reporting Issues
Include the following information:
- Operating system and version
- Docker version
- Error messages and logs
- Configuration (sanitized)
- Steps to reproduce

---

**SaleSpider Deployment System v2.0.0**  
*Platform-agnostic, production-ready, secure deployment*
