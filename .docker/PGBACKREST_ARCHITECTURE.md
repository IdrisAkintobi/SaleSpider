# pgBackRest Configuration Architecture

## Overview

The pgBackRest configuration system uses a **centralized generation approach** where a dedicated setup service creates the configuration once, then shares it with all other services via a Docker volume.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Setup Service (runs first)               │
│                                                              │
│  1. Reads base template:                                    │
│     config/pgbackrest/pgbackrest.conf                       │
│                                                              │
│  2. Reads environment variables:                            │
│     - PGBACKREST_REPO1_TYPE (none/posix/s3/azure/gcs)           │
│     - S3/Azure/GCS credentials                             │
│                                                              │
│  3. Generates complete configuration:                       │
│     - pgbackrest.conf (base + static settings)             │
│     - conf.d/repo.conf (dynamic repository settings)       │
│                                                              │
│  4. Writes to shared volume:                                │
│     pgbackrest-config:/pgbackrest-config                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Shared Volume
                              ▼
        ┌─────────────────────────────────────┐
        │     pgbackrest-config volume        │
        │  /etc/pgbackrest/pgbackrest.conf    │
        │  /etc/pgbackrest/conf.d/repo.conf   │
        └─────────────────────────────────────┘
                    │                │
        ┌───────────┘                └───────────┐
        ▼                                        ▼
┌──────────────────┐                  ┌──────────────────┐
│ PostgreSQL       │                  │ Backup Service   │
│                  │                  │                  │
│ Mounts:          │                  │ Mounts:          │
│ pgbackrest-      │                  │ pgbackrest-      │
│ config:/etc/     │                  │ config:/etc/     │
│ pgbackrest:ro    │                  │ pgbackrest:ro    │
│                  │                  │                  │
│ Uses config for: │                  │ Uses config for: │
│ - WAL archiving  │                  │ - Full backups   │
│ - archive-push   │                  │ - Differential   │
│                  │                  │ - Cleanup        │
└──────────────────┘                  └──────────────────┘
```

## Service Responsibilities

### 1. Setup Service
**File:** `.docker/scripts/setup/configure-pgbackrest.sh`

**Responsibilities:**
- Reads base configuration template
- Reads environment variables for cloud storage
- Generates complete pgBackRest configuration
- Writes to shared volume
- Runs **once** at deployment time

**Output:**
```
/pgbackrest-config/
├── pgbackrest.conf          # Base + static settings
└── conf.d/
    └── repo.conf            # Dynamic repository settings
```

### 2. PostgreSQL Service
**File:** `.docker/scripts/postgres/install-pgbackrest.sh`

**Responsibilities:**
- Creates necessary directories
- Sets proper permissions
- Mounts shared config volume (read-only)
- Uses config for WAL archiving

**No longer does:**
- ❌ Generate configuration
- ❌ Write config files
- ❌ Handle cloud credentials

### 3. Backup Service
**File:** `.docker/scripts/backup/start-pgbackrest.sh`

**Responsibilities:**
- Creates necessary directories
- Mounts shared config volume (read-only)
- Verifies configuration exists
- Runs backup operations

**No longer does:**
- ❌ Generate configuration
- ❌ Write config files
- ❌ Handle cloud credentials

## Configuration Files

### Base Template
**Location:** `.docker/config/pgbackrest/pgbackrest.conf`

**Contains:**
- Logging levels
- Retention policy (8 full, 14 differential)
- Compression settings (lz4, level 3)
- Performance tuning (process-max, async)
- Stanza configuration

**Version controlled:** ✅ Yes (tracked in git)

### Dynamic Configuration
**Location:** Generated at `/etc/pgbackrest/conf.d/repo.conf`

**Contains:**
- Repository type (none/posix/s3/azure/gcs)
- Repository path
- Cloud storage credentials (S3/Azure/GCS)

**Version controlled:** ❌ No (contains secrets)

## Docker Volumes

### pgbackrest-config
**Type:** Named volume  
**Created by:** Setup service  
**Mounted by:** PostgreSQL, Backup services  
**Mount point:** `/etc/pgbackrest` (read-only)  
**Lifecycle:** Persists across container restarts

## Benefits

### 1. **Centralized Generation**
- Configuration generated **once** by setup service
- No duplication across services
- Consistent configuration guaranteed

### 2. **No Runtime Overhead**
- Config created at deployment time
- Services just mount and use
- Faster container startup

### 3. **Dependency Management**
- Setup service runs first
- Other services depend on setup completion
- Ensures config exists before use

### 4. **Security**
- Secrets only in environment variables
- Config volume not exposed externally
- Read-only mounts prevent tampering

### 5. **Maintainability**
- Single script to update (`configure-pgbackrest.sh`)
- Clear separation of concerns
- Easy to debug and test

## Updating Configuration

### Change Static Settings (Retention, Compression)
```bash
# 1. Edit base template
vim .docker/config/pgbackrest/pgbackrest.conf

# 2. Regenerate configuration
docker-compose up setup

# 3. Restart services to apply
docker-compose restart postgres backup
```

### Change Dynamic Settings (S3 Credentials)
```bash
# 1. Update environment variables
vim .env
# Change: PGBACKREST_REPO1_S3_BUCKET=new-bucket

# 2. Regenerate configuration
docker-compose up setup

# 3. Restart services to apply
docker-compose restart postgres backup
```

## Troubleshooting

### Configuration Not Found
```bash
# Check if setup service ran successfully
docker-compose logs setup

# Verify volume exists
docker volume ls | grep pgbackrest-config

# Check volume contents
docker run --rm -v pgbackrest-config:/config alpine ls -la /config
```

### Configuration Not Applied
```bash
# Verify services are mounting the volume
docker-compose config | grep pgbackrest-config

# Check mounted config in running container
docker exec salespider-backup cat /etc/pgbackrest/pgbackrest.conf
docker exec salespider-postgres cat /etc/pgbackrest/pgbackrest.conf
```

### Regenerate Configuration
```bash
# Remove old config and regenerate
docker volume rm pgbackrest-config
docker volume create pgbackrest-config
docker-compose up setup
docker-compose restart postgres backup
```

## Migration from Old Architecture

### Before (Duplicated Generation)
- Each service generated its own config
- Configuration code duplicated in 2 scripts
- Risk of config drift between services
- Runtime overhead on every container start

### After (Centralized Generation)
- Setup service generates config once
- Single source of configuration logic
- Guaranteed consistency via shared volume
- No runtime generation overhead

## File Structure

```
.docker/
├── config/
│   └── pgbackrest/
│       ├── pgbackrest.conf          # Base template (version controlled)
│       └── README.md                # Documentation
├── scripts/
│   ├── setup/
│   │   └── configure-pgbackrest.sh  # Configuration generator
│   ├── postgres/
│   │   └── install-pgbackrest.sh    # Simplified (no config generation)
│   └── backup/
│       └── start-pgbackrest.sh      # Simplified (no config generation)
└── compose/
    ├── setup.yml                    # Setup service definition
    ├── postgres.yml                 # PostgreSQL with volume mount
    └── backup.yml                   # Backup with volume mount
```

## Summary

This architecture provides:
- ✅ **Single source of truth** for configuration
- ✅ **No duplication** of configuration logic
- ✅ **Centralized generation** in setup service
- ✅ **Shared volume** for distribution
- ✅ **Read-only mounts** for security
- ✅ **Dependency management** via service ordering
- ✅ **Easy maintenance** and updates
- ✅ **Clear separation** of concerns
