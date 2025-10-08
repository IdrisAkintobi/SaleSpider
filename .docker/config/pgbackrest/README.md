# pgBackRest Configuration

This directory contains the **base configuration template** for pgBackRest used by both PostgreSQL and Backup containers.

## Architecture

### Configuration Generation Flow

```
1. Setup Service (runs first)
   ├── Reads: config/pgbackrest/pgbackrest.conf (base template)
   ├── Reads: Environment variables (S3/Azure/GCS credentials)
   └── Generates: Shared volume with complete config

2. PostgreSQL & Backup Services
   └── Mount: Shared volume at /etc/pgbackrest (read-only)
```

### Base Configuration (`pgbackrest.conf`)
- **Template file** in this directory
- Contains static settings: logging, retention, compression, performance
- **Single source of truth** - edit once, applies everywhere

### Dynamic Configuration (`conf.d/repo.conf`)
- **Generated once** by setup service at deployment time
- Contains environment-specific settings: repository type, S3/Azure/GCS credentials
- Shared via Docker volume to all services

## Configuration Structure

```
/etc/pgbackrest/
├── pgbackrest.conf          # Base config (mounted from volume)
└── conf.d/
    └── repo.conf            # Dynamic config (generated at runtime)
```

pgBackRest automatically merges configurations from:
1. `/etc/pgbackrest/pgbackrest.conf` (base)
2. `/etc/pgbackrest/conf.d/*.conf` (overrides/additions)

## Editing Configuration

### Static Settings (Retention, Compression, etc.)
Edit `pgbackrest.conf` in this directory:
```bash
vim .docker/config/pgbackrest/pgbackrest.conf
```

Then regenerate configuration:
```bash
docker-compose up setup  # Regenerates config in shared volume
docker-compose restart postgres backup  # Apply changes
```

### Dynamic Settings (S3, Azure, GCS)
Set environment variables in `.env`:
```bash
PGBACKREST_REPO1_TYPE=s3
PGBACKREST_REPO1_S3_BUCKET=my-bucket
PGBACKREST_REPO1_S3_REGION=us-east-1
```

Then regenerate configuration:
```bash
docker-compose up setup  # Regenerates config with new credentials
docker-compose restart postgres backup  # Apply changes
```

## Benefits

✅ **Centralized Generation**: Setup service generates config once for all services
✅ **No Duplication**: Single config shared via Docker volume
✅ **No Runtime Generation**: Config created at deployment, not at each container start
✅ **Consistent Configuration**: All services use identical config
✅ **Environment Flexibility**: Dynamic settings via environment variables
✅ **Easy Maintenance**: Clear separation of static vs dynamic config
✅ **Version Control**: Base config tracked in git, secrets stay in env vars
✅ **Dependency Management**: Setup service ensures config exists before other services start

## Configuration Sections

### `[global]`
- Logging levels (console and file)
- Retention policy (full and differential backups)
- Compression settings (type and level)
- Performance tuning (process-max, async settings)

### `[salespider]`
- PostgreSQL database path
- Stanza-specific settings

### Dynamic (conf.d/repo.conf)
- Repository type (none, posix, s3, azure, gcs)
- Repository path
- Cloud storage credentials (S3/Azure/GCS)
