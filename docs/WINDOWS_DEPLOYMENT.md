# Windows Server Deployment Guide

Complete guide for deploying SaleSpider on Windows Server using WSL 2 and Docker Desktop.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [WSL 2 Setup](#wsl-2-setup)
3. [Docker Desktop Installation](#docker-desktop-installation)
4. [SaleSpider Deployment](#salespider-deployment)
5. [Windows-Specific Configuration](#windows-specific-configuration)
6. [Troubleshooting](#troubleshooting)
7. [Management & Maintenance](#management--maintenance)

---

## Prerequisites

### System Requirements

- **Windows Server 2019** or later (or Windows 10/11 Pro/Enterprise)
- **4GB+ RAM** available for Docker
- **10GB+ disk space**
- **Administrator access**
- **Internet connection**

### Required Features

- Hyper-V (enabled automatically by Docker Desktop)
- Windows Subsystem for Linux (WSL 2)
- Virtualization enabled in BIOS

---

## WSL 2 Setup

WSL 2 is **required** for Docker Desktop on Windows. Follow these steps to install and configure it.

### Step 1: Enable WSL

Open **PowerShell as Administrator** and run:

```powershell
# Enable WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart your computer
Restart-Computer
```

### Step 2: Install WSL 2

After restart, open **PowerShell as Administrator** again:

```powershell
# Install WSL 2
wsl --install

# Set WSL 2 as default version
wsl --set-default-version 2
```

### Step 3: Install Ubuntu

Install Ubuntu (recommended distribution):

```powershell
# Install Ubuntu from Microsoft Store
wsl --install -d Ubuntu

# Or install Ubuntu 22.04 LTS specifically
wsl --install -d Ubuntu-22.04
```

**First-time setup:**

1. Ubuntu will launch automatically
2. Create a username (lowercase, no spaces)
3. Create a password (you'll need this for `sudo` commands)

### Step 4: Verify WSL Installation

```powershell
# Check WSL version
wsl --list --verbose

# Should show:
#   NAME            STATE           VERSION
# * Ubuntu          Running         2
```

### Step 5: Update Ubuntu

Open Ubuntu (from Start menu or run `wsl` in PowerShell):

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget
```

---

## Docker Desktop Installation

### Step 1: Download Docker Desktop

1. Visit: https://www.docker.com/products/docker-desktop/
2. Download **Docker Desktop for Windows**
3. Run the installer

### Step 2: Installation Options

During installation:

- ✅ **Enable WSL 2 integration** (required)
- ✅ **Add shortcut to desktop** (optional)

### Step 3: Configure Docker Desktop

After installation, open **Docker Desktop**:

1. **Settings → General:**
   - ✅ Use WSL 2 based engine
   - ✅ Start Docker Desktop when you log in (optional)

2. **Settings → Resources → WSL Integration:**
   - ✅ Enable integration with my default WSL distro
   - ✅ Enable integration with additional distros: **Ubuntu**

3. **Settings → Resources → Advanced:**
   - **Memory:** 4GB minimum (8GB recommended)
   - **CPUs:** 2 minimum (4 recommended)
   - **Disk image size:** 20GB minimum

4. Click **Apply & Restart**

### Step 4: Verify Docker Installation

Open **Ubuntu** (WSL) and verify:

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version

# Test Docker
docker run hello-world
```

If successful, you'll see "Hello from Docker!" message.

---

## SaleSpider Deployment

Now that WSL 2 and Docker are set up, deploy SaleSpider from within Ubuntu.

### Step 1: Access Your Files

**Important:** Work from within WSL for best performance.

```bash
# Your Windows drives are mounted at /mnt/
# C:\ is at /mnt/c/
# D:\ is at /mnt/d/

# Navigate to where you want to install SaleSpider
# Option 1: Use WSL home directory (recommended)
cd ~

# Option 2: Use Windows directory (slower)
cd /mnt/c/Projects
```

### Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/IdrisAkintobi/SaleSpider.git
cd SaleSpider

# Verify files
ls -la
```

### Step 3: Initial Setup

```bash
# Make scripts executable and create .env
make setup

# This will:
# - Make all scripts executable
# - Copy env.example to .env
# - Prompt you to edit configuration
```

### Step 4: Configure Environment

Edit the `.env` file with your settings:

```bash
# Use nano editor (easier for beginners)
nano .env

# Or use vim if you prefer
vim .env
```

**Essential settings to configure:**

```bash
# Domain Configuration
DOMAIN=salespider.yourcompany.local
HOST_IP=auto  # Will auto-detect Windows Server IP

# Database Security
POSTGRES_PASSWORD=YourSecurePassword123!

# Application Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Admin Account
SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=SecureAdminPassword123!

# AI Features (optional)
GEMINI_API_KEY=your-gemini-api-key-here
```

**Save and exit:**

- In nano: `Ctrl+X`, then `Y`, then `Enter`
- In vim: Press `Esc`, type `:wq`, press `Enter`

### Step 5: Deploy

```bash
# Full deployment
make deploy

# This will:
# - Check system requirements
# - Generate SSL certificates
# - Create Docker volumes
# - Start all services
# - Run database migrations
# - Seed initial data
```

**Deployment takes 2-5 minutes.** You'll see progress messages.

### Step 6: Verify Deployment

```bash
# Check service status
make status

# View logs
make logs

# Test health
docker compose ps
```

All services should show as "healthy" or "running".

---

## Windows-Specific Configuration

### Accessing SaleSpider from Windows

**From the Windows Server itself:**

- https://localhost
- https://127.0.0.1
- https://salespider.local (if configured)

**From other computers on the network:**

- https://YOUR_SERVER_IP (e.g., https://192.168.1.100)
- https://salespider.yourcompany.local (if DNS configured)

### Finding Your Server IP

**In PowerShell:**

```powershell
ipconfig | findstr IPv4
```

**In WSL:**

```bash
# Get Windows host IP
ip route show | grep -i default | awk '{ print $3}'

# Or check .env file
grep HOST_IP .env
```

### SSL Certificate Trust

**On Windows Server:**

1. **Export certificate from WSL to Windows:**

   ```bash
   # In WSL
   cp .docker/ssl/cert.pem /mnt/c/Users/Public/salespider-cert.pem
   ```

2. **Install certificate in Windows:**
   ```powershell
   # In PowerShell as Administrator
   Import-Certificate -FilePath "C:\Users\Public\salespider-cert.pem" -CertStoreLocation "Cert:\LocalMachine\Root"
   ```

**On client computers:**

1. Copy `C:\Users\Public\salespider-cert.pem` from server to client
2. Double-click the certificate file
3. Click "Install Certificate"
4. Select "Local Machine"
5. Place in "Trusted Root Certification Authorities"
6. Click "Finish"

### Windows Firewall Configuration

Allow incoming connections on ports 80 and 443:

```powershell
# In PowerShell as Administrator

# Allow HTTP (port 80)
New-NetFirewallRule -DisplayName "SaleSpider HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow HTTPS (port 443)
New-NetFirewallRule -DisplayName "SaleSpider HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

Or use custom ports if 80/443 are in use:

```bash
# In .env file
HTTP_PORT=8080
HTTPS_PORT=8443
```

Then allow those ports in firewall:

```powershell
New-NetFirewallRule -DisplayName "SaleSpider Custom HTTP" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "SaleSpider Custom HTTPS" -Direction Inbound -LocalPort 8443 -Protocol TCP -Action Allow
```

### Disable Conflicting Services

If IIS or other services are using ports 80/443:

```powershell
# Stop IIS
Stop-Service W3SVC
Set-Service W3SVC -StartupType Disabled

# Or use custom ports for SaleSpider instead
```

---

## Troubleshooting

### WSL Issues

#### **WSL not starting**

```powershell
# Check WSL status
wsl --status

# Restart WSL
wsl --shutdown
wsl

# Update WSL
wsl --update
```

#### **"WSL 2 requires an update to its kernel component"**

Download and install: https://aka.ms/wsl2kernel

#### **Ubuntu not found**

```powershell
# List installed distributions
wsl --list

# Install Ubuntu
wsl --install -d Ubuntu
```

### Docker Issues

#### **Docker Desktop not starting**

1. Check Hyper-V is enabled:

   ```powershell
   Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V
   ```

2. Restart Docker Desktop
3. Check Docker Desktop logs: Settings → Troubleshoot → View logs

#### **"Docker daemon is not running"**

1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray)
3. Verify in WSL:
   ```bash
   docker info
   ```

#### **"Cannot connect to Docker daemon"**

```bash
# In WSL, check Docker integration
docker context ls

# Should show "desktop-linux" as current
```

If not working:

1. Docker Desktop → Settings → Resources → WSL Integration
2. Enable integration with Ubuntu
3. Apply & Restart

### Deployment Issues

#### **"Permission denied" errors**

```bash
# Make scripts executable
chmod +x deploy.sh
find .docker/scripts -type f -name "*.sh" -exec chmod +x {} \;

# Or use make
make perms
```

#### **Port conflicts**

```bash
# Check what's using ports
netstat -ano | findstr :80
netstat -ano | findstr :443

# Change ports in .env
nano .env
# Set: HTTP_PORT=8080 and HTTPS_PORT=8443

# Restart
make restart
```

#### **Services not starting**

```bash
# Check logs
make logs

# Check specific service
docker compose logs app
docker compose logs postgres

# Check resource usage
docker stats
```

#### **Database connection errors**

```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Check database logs
docker compose logs postgres

# Test connection
docker exec salespider-postgres psql -U postgres -d salespider -c "\dt"
```

### Performance Issues

#### **Slow file access**

**Problem:** Files in `/mnt/c/` are slower than native WSL filesystem.

**Solution:** Move project to WSL home directory:

```bash
# Move from Windows to WSL
mv /mnt/c/Projects/SaleSpider ~/SaleSpider
cd ~/SaleSpider
```

#### **High memory usage**

Limit Docker resources in Docker Desktop:

- Settings → Resources → Advanced
- Reduce Memory to 4GB
- Reduce CPUs to 2

Or adjust in `.env`:

```bash
APP_MEMORY_LIMIT=1G
POSTGRES_MEMORY_LIMIT=512M
```

#### **Disk space issues**

```bash
# Clean up Docker
docker system prune -a

# Clean up WSL
sudo apt autoremove
sudo apt clean
```

### Network Issues

#### **Cannot access from other computers**

1. **Check Windows Firewall** (see configuration section above)
2. **Verify server IP:**
   ```bash
   grep HOST_IP .env
   ```
3. **Test from server first:**
   ```powershell
   curl https://localhost -k
   ```
4. **Test from client:**
   ```powershell
   curl https://SERVER_IP -k
   ```

#### **SSL certificate warnings**

This is normal for self-signed certificates. Options:

1. **Accept in browser** (click "Advanced" → "Proceed")
2. **Install certificate** (see SSL Certificate Trust section)
3. **Use HTTP** (not recommended for production)

---

## Management & Maintenance

### Daily Operations

All commands run from WSL (Ubuntu):

```bash
# Navigate to project
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
# Manual backup
make backup

# View backup info
make backup-info

# Restore from latest backup
make restore

# Restore to specific time
make restore-pitr TIME="2024-11-15 14:30:00"
```

### Automated Backups

Set up Windows Task Scheduler to run backups:

1. **Create backup script** (`C:\Scripts\salespider-backup.bat`):

   ```batch
   @echo off
   wsl -d Ubuntu -e bash -c "cd ~/SaleSpider && make backup"
   ```

2. **Create scheduled task:**
   ```powershell
   # Daily backup at 2 AM
   $action = New-ScheduledTaskAction -Execute "C:\Scripts\salespider-backup.bat"
   $trigger = New-ScheduledTaskTrigger -Daily -At 2am
   Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "SaleSpider Backup" -Description "Daily SaleSpider database backup"
   ```

### Updates

```bash
# Pull latest changes
git pull

# Update deployment
make update

# Or rebuild from scratch
make deploy
```

### Monitoring

```bash
# Service health
make health

# Resource usage
docker stats

# Disk usage
df -h
du -sh ~/SaleSpider/data
```

### Accessing Services

```bash
# Application shell
make app-shell

# Database shell
make db-shell

# PostgreSQL client
docker exec -it salespider-postgres psql -U postgres -d salespider
```

---

## Starting SaleSpider After Reboot

Docker Desktop should start automatically. If not:

1. **Start Docker Desktop** (from Start menu)
2. **Wait for Docker to be ready** (whale icon in system tray)
3. **Start SaleSpider:**
   ```bash
   # In WSL
   cd ~/SaleSpider
   make start
   ```

### Auto-start on Boot (Optional)

**Option 1: Docker Desktop auto-start**

- Docker Desktop → Settings → General
- ✅ Start Docker Desktop when you log in

**Option 2: Windows Task Scheduler**

Create startup task:

```powershell
$action = New-ScheduledTaskAction -Execute "wsl" -Argument "-d Ubuntu -e bash -c 'cd ~/SaleSpider && make start'"
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -TaskName "SaleSpider Auto-start" -Description "Start SaleSpider on system boot"
```

---

## Best Practices for Windows Deployment

### 1. Use WSL Filesystem

Store project in WSL home directory (`~/SaleSpider`) for better performance:

- ✅ Faster file access
- ✅ Better Docker performance
- ✅ Proper Unix permissions

### 2. Regular Backups

- Enable automated backups (see Automated Backups section)
- Test restore procedures regularly
- Store backups on separate drive/network location

### 3. Resource Allocation

- Allocate sufficient resources to Docker Desktop
- Monitor resource usage with `docker stats`
- Adjust limits in `.env` if needed

### 4. Security

- Change default passwords immediately
- Keep Windows Server updated
- Configure Windows Firewall properly
- Use strong SSL certificates for production

### 5. Monitoring

- Check logs regularly: `make logs`
- Monitor service health: `make status`
- Set up alerts for service failures

### 6. Documentation

- Document your specific configuration
- Keep track of customizations
- Note any Windows-specific issues encountered

---

## Getting Help

### Check Logs

```bash
# All services
make logs

# Specific service
docker compose logs app
docker compose logs postgres
docker compose logs proxy
```

### Verify Configuration

```bash
# Show current configuration
docker compose config

# Check environment variables
cat .env | grep -v "^#" | grep -v "^$"
```

### Common Commands Reference

```bash
# Status and monitoring
make status          # Service status
make health          # Health checks
make logs            # View logs
docker stats         # Resource usage

# Service management
make start           # Start services
make stop            # Stop services
make restart         # Restart services

# Database operations
make backup          # Create backup
make restore         # Restore backup
make db-shell        # Database shell

# Troubleshooting
make logs SERVICE=app      # App logs
make logs SERVICE=postgres # DB logs
docker compose ps          # Service list
docker compose config      # Show config
```

---

## Additional Resources

- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Environment Variables:** [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)
- **Backup Guide:** [BACKUP_GUIDE.md](BACKUP_GUIDE.md)
- **Makefile Commands:** [MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md)

### External Resources

- **WSL Documentation:** https://docs.microsoft.com/en-us/windows/wsl/
- **Docker Desktop for Windows:** https://docs.docker.com/desktop/windows/
- **Ubuntu WSL:** https://ubuntu.com/wsl

---

**Need more help?** Check the troubleshooting section or review the logs with `make logs`.
