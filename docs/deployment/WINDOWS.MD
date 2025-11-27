# Windows Deployment

Deploy SaleSpider on Windows Server or Windows 10/11 using WSL 2 and Docker Desktop.

## Overview

Windows deployment uses:

- Windows Subsystem for Linux (WSL 2)
- Docker Desktop for Windows
- Ubuntu distribution in WSL
- Self-hosted PostgreSQL database

## Prerequisites

### System Requirements

- Windows Server 2019+ or Windows 10/11 Pro/Enterprise
- 4GB+ RAM available
- 10GB+ disk space
- Administrator access
- Virtualization enabled in BIOS

## Quick Start

### 1. Enable WSL 2

Open PowerShell as Administrator:

```powershell
# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart computer
Restart-Computer
```

After restart:

```powershell
# Install WSL 2
wsl --install

# Set WSL 2 as default
wsl --set-default-version 2

# Install Ubuntu
wsl --install -d Ubuntu
```

### 2. Install Docker Desktop

1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Run installer
3. Enable WSL 2 integration during installation
4. Restart computer

### 3. Configure Docker Desktop

Open Docker Desktop:

1. Settings → General
   - ✅ Use WSL 2 based engine

2. Settings → Resources → WSL Integration
   - ✅ Enable integration with Ubuntu

3. Settings → Resources → Advanced
   - Memory: 4GB minimum (8GB recommended)
   - CPUs: 2 minimum (4 recommended)

4. Apply & Restart

### 4. Deploy SaleSpider

Open Ubuntu from Start menu:

```bash
# Clone repository
git clone https://github.com/IdrisAkintobi/SaleSpider.git
cd SaleSpider

# Configure environment
cp env.example .env
nano .env

# Deploy
make deploy
```

### 5. Access Application

From Windows:

- https://localhost
- https://127.0.0.1

From network:

- https://YOUR_SERVER_IP

## Configuration

### Environment Variables

Edit `.env` in Ubuntu:

```bash
# Database
DATABASE_URL="postgresql://salespider:password@postgres:5432/salespider"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backup
SETUP_BACKUP="true"
```

### Windows Firewall

Allow incoming connections:

```powershell
# In PowerShell as Administrator

# Allow HTTP
New-NetFirewallRule -DisplayName "SaleSpider HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow HTTPS
New-NetFirewallRule -DisplayName "SaleSpider HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

### SSL Certificate

Install self-signed certificate:

```bash
# In WSL, export certificate
cp .docker/ssl/cert.pem /mnt/c/Users/Public/salespider-cert.pem
```

```powershell
# In PowerShell as Administrator
Import-Certificate -FilePath "C:\Users\Public\salespider-cert.pem" -CertStoreLocation "Cert:\LocalMachine\Root"
```

## Management

### Daily Operations

In Ubuntu (WSL):

```bash
cd ~/SaleSpider

# Check status
make status

# View logs
make logs

# Restart services
make restart

# Stop services
make stop

# Start services
make start
```

### Backup & Restore

```bash
# Create backup
make backup

# Restore backup
make restore

# View backup info
make backup-info
```

### Automated Backups

Create Windows Task Scheduler task:

1. Create `C:\Scripts\salespider-backup.bat`:

   ```batch
   @echo off
   wsl -d Ubuntu -e bash -c "cd ~/SaleSpider && make backup"
   ```

2. Schedule task:
   ```powershell
   $action = New-ScheduledTaskAction -Execute "C:\Scripts\salespider-backup.bat"
   $trigger = New-ScheduledTaskTrigger -Daily -At 2am
   Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "SaleSpider Backup"
   ```

## Troubleshooting

### WSL Issues

**WSL not starting:**

```powershell
wsl --shutdown
wsl --update
wsl
```

**Ubuntu not found:**

```powershell
wsl --list
wsl --install -d Ubuntu
```

### Docker Issues

**Docker not starting:**

1. Check Hyper-V is enabled
2. Restart Docker Desktop
3. Check Docker Desktop logs

**Cannot connect to Docker:**

1. Docker Desktop → Settings → Resources → WSL Integration
2. Enable integration with Ubuntu
3. Apply & Restart

### Port Conflicts

If ports 80/443 are in use:

```bash
# In .env
HTTP_PORT=8080
HTTPS_PORT=8443
```

Update firewall rules accordingly.

### Performance Issues

**Slow file access:**

- Use WSL filesystem (`~/SaleSpider`) instead of Windows filesystem (`/mnt/c/`)

**High memory usage:**

- Reduce Docker memory in Docker Desktop settings
- Adjust limits in `.env`

## Auto-Start on Boot

### Option 1: Docker Desktop

Docker Desktop → Settings → General

- ✅ Start Docker Desktop when you log in

### Option 2: Task Scheduler

```powershell
$action = New-ScheduledTaskAction -Execute "wsl" -Argument "-d Ubuntu -e bash -c 'cd ~/SaleSpider && make start'"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -TaskName "SaleSpider Auto-start"
```

## Best Practices

### 1. Use WSL Filesystem

Store project in WSL home directory for better performance:

```bash
cd ~
git clone https://github.com/IdrisAkintobi/SaleSpider.git
```

### 2. Regular Backups

- Enable automated backups
- Test restore procedures
- Store backups on separate drive

### 3. Resource Allocation

- Allocate sufficient memory to Docker
- Monitor with `docker stats`
- Adjust limits as needed

### 4. Security

- Change default passwords
- Keep Windows updated
- Configure firewall properly
- Use strong SSL certificates

## Network Access

### From Windows Server

- https://localhost
- https://127.0.0.1

### From Other Computers

Find server IP:

```powershell
ipconfig | findstr IPv4
```

Access at:

- https://SERVER_IP

### DNS Configuration

For custom domain:

1. Configure DNS server
2. Point domain to server IP
3. Update `NEXT_PUBLIC_APP_URL` in `.env`

## Updating

```bash
# In WSL
cd ~/SaleSpider

# Pull latest changes
git pull

# Update deployment
make update
```

## Monitoring

```bash
# Service status
make status

# Resource usage
docker stats

# Disk usage
df -h
```

## Common Commands

```bash
# Status and monitoring
make status          # Service status
make health          # Health checks
make logs            # View logs

# Service management
make start           # Start services
make stop            # Stop services
make restart         # Restart services

# Database operations
make backup          # Create backup
make restore         # Restore backup
make db-shell        # Database shell

# Troubleshooting
docker compose ps    # Service list
docker compose logs  # View logs
```

## Benefits

- ✅ **Native Windows** - Runs on Windows Server
- ✅ **Full Control** - Complete access to all components
- ✅ **Offline Capable** - Works without internet
- ✅ **Familiar Environment** - Windows management tools

## Limitations

- ⚠️ **WSL Required** - Needs WSL 2 setup
- ⚠️ **Resource Overhead** - WSL and Docker overhead
- ⚠️ **Complexity** - More complex than Linux deployment

## Related Documentation

- [Self-Hosted Deployment](/deployment/self-hosted)
- [Backup & Restore](/operations/backup-restore)
- [Makefile Commands](/operations/makefile)
- [Offline Operation](/deployment/offline)

## External Resources

- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
- [Ubuntu WSL](https://ubuntu.com/wsl)
