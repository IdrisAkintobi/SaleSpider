# SaleSpider Deployment Options

This guide explains the different deployment configurations available for SaleSpider, depending on your database hosting preference.

## Option 1: Self-Hosted Database (Full Stack)

**Best for:** Complete control, on-premises deployment, development environments

**What's included:**
- PostgreSQL database container
- pgBackRest backup system
- Application container
- Reverse proxy with SSL

**Files needed:**
- `.env` (copy from existing `.env` file)
- `.docker/docker-compose.yml` (default)

**Setup:**
```bash
# Use the existing .env file
cp .env.example .env
# Edit .env with your configuration
docker-compose up -d
```

## Option 2: Hosted Database (Application Only)

**Best for:** Production deployments, managed database services, simplified maintenance

**Supported providers:**
- [Neon](https://neon.tech) (PostgreSQL)
- [Supabase](https://supabase.com) (PostgreSQL)
- [PlanetScale](https://planetscale.com) (MySQL)
- [Railway](https://railway.app) (PostgreSQL)
- [Heroku Postgres](https://www.heroku.com/postgres)
- Any other hosted PostgreSQL/MySQL provider

**What's included:**
- Application container only
- Reverse proxy with SSL
- No local database or backup containers

**Files needed:**
- `.env` (same file as self-hosted, just different DATABASE_URL)
- `.docker/docker-compose.hosted-db.yml`

**Setup:**
```bash
# Use your existing .env file or copy from the main .env
# Edit .env with your hosted database URL
nano .env

# Update these key variables:
# DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/database_name?sslmode=require"
# PGBACKREST_REPO1_TYPE=none

# Start the application using Makefile (recommended)
make deploy-hosted-db-app

# Or start manually
docker compose -f .docker/docker-compose.hosted-db.yml up -d
```

## Key Differences

| Feature | Self-Hosted | Hosted Database |
|---------|-------------|-----------------|
| Database Management | Manual | Provider managed |
| Backups | pgBackRest included | Provider handled |
| Scaling | Manual container scaling | Provider auto-scaling |
| Monitoring | Self-managed | Provider dashboards |
| Cost | Infrastructure costs | Service subscription |
| Maintenance | Full responsibility | Database managed |
| Setup Complexity | Higher (more containers) | Lower (app only) |

## Migration Between Options

### From Self-Hosted to Hosted Database

1. Export your current database:
   ```bash
   docker exec salespider-postgres-1 pg_dump -U postgres salespider > backup.sql
   ```

2. Import to your hosted database provider

3. Switch to hosted configuration:
   ```bash
   cp .env.hosted-db.example .env
   # Update DATABASE_URL in .env
   COMPOSE_FILE=.docker/docker-compose.hosted-db.yml docker-compose up -d
   ```

### From Hosted Database to Self-Hosted

1. Export from your hosted provider

2. Switch to self-hosted configuration:
   ```bash
   # Update .env to use self-hosted settings
   docker-compose up -d
   ```

3. Import your data to the local PostgreSQL container

## Environment Variables

### Required for Hosted Database
- `DATABASE_URL` - Your hosted database connection string
- `COMPOSE_FILE` - Set to `.docker/docker-compose.hosted-db.yml`
- `PGBACKREST_REPO1_TYPE` - Set to `none` (backups handled by provider)

### Security Considerations
- Always use SSL/TLS for hosted database connections
- Store sensitive credentials securely (consider using secrets management)
- Regularly rotate database passwords
- Enable connection pooling for better performance

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check if your hosted database allows connections from your IP
- Ensure SSL settings match your provider's requirements

### Performance
- Adjust `DATABASE_POOL_SIZE` based on your hosted database plan limits
- Monitor connection usage in your provider's dashboard
- Consider connection pooling tools like PgBouncer for high-traffic applications

## Support

For provider-specific issues:
- Check your database provider's documentation
- Review connection limits and pricing tiers
- Monitor database performance metrics in provider dashboards

For SaleSpider application issues:
- Check application logs: `docker-compose logs app`
- Review proxy logs: `docker-compose logs proxy`
- Verify environment configuration