# Environment Variables

SaleSpider uses environment variables for configuration. This guide covers all available environment variables and their purposes.

## Database Configuration

### `DATABASE_URL`

- **Required**: Yes
- **Description**: PostgreSQL connection string
- **Format**: `postgresql://user:password@host:port/database`
- **Example**: `postgresql://salespider:password@localhost:5432/salespider`

## Authentication & Security

### `JWT_SECRET`

- **Required**: Yes
- **Description**: Secret key for JWT token signing
- **Security**: Must be a strong, random string (minimum 32 characters)
- **Example**: `your-super-secret-jwt-key-change-this-in-production`

### `JWT_EXPIRES_IN`

- **Required**: No
- **Default**: `7d`
- **Description**: JWT token expiration time
- **Format**: Time string (e.g., `1h`, `7d`, `30d`)

## AI Features

### `GOOGLE_GENAI_API_KEY`

- **Required**: For AI features
- **Description**: Google Generative AI API key for AI-powered insights
- **How to get**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)

## Application Settings

### `NODE_ENV`

- **Required**: No
- **Default**: `development`
- **Options**: `development`, `production`, `test`
- **Description**: Application environment mode

### `PORT`

- **Required**: No
- **Default**: `3000`
- **Description**: Port number for the application server

### `NEXT_PUBLIC_APP_URL`

- **Required**: For production
- **Description**: Public URL of your application
- **Example**: `https://yourdomain.com`

## Rate Limiting

### `RATE_LIMIT_ENABLED`

- **Required**: No
- **Default**: `true`
- **Description**: Enable/disable rate limiting
- **Options**: `true`, `false`

### `RATE_LIMIT_MAX_REQUESTS`

- **Required**: No
- **Default**: `100`
- **Description**: Maximum requests per window

### `RATE_LIMIT_WINDOW_MS`

- **Required**: No
- **Default**: `900000` (15 minutes)
- **Description**: Rate limit window in milliseconds

## Backup Configuration

### `PGBACKREST_REPO1_PATH`

- **Required**: For backups
- **Default**: `/var/lib/pgbackrest`
- **Description**: Path to pgBackRest repository

### `PGBACKREST_LOG_PATH`

- **Required**: No
- **Default**: `/var/log/pgbackrest`
- **Description**: Path to pgBackRest logs

## Example Configuration Files

### Development (.env)

```bash
# Database
DATABASE_URL="postgresql://salespider:password@localhost:5432/salespider"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# AI Features (optional)
GOOGLE_GENAI_API_KEY="your-google-ai-api-key"

# Application
NODE_ENV="development"
PORT=3000
```

### Production (.env.production)

```bash
# Database
DATABASE_URL="postgresql://user:password@production-host:5432/salespider"

# Authentication
JWT_SECRET="production-secret-key-minimum-32-characters-long"
JWT_EXPIRES_IN="7d"

# AI Features
GOOGLE_GENAI_API_KEY="your-production-google-ai-api-key"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## Security Best Practices

1. **Use strong, random values** for `JWT_SECRET` (minimum 32 characters)
2. **Rotate secrets regularly** in production environments
3. **Use different secrets** for development and production
4. **Restrict database access** to specific IP addresses
5. **Enable rate limiting** in production
6. **Use HTTPS** in production environments

## Environment-Specific Configuration

### Docker Compose

When using Docker Compose, environment variables are set in:

- `.env` file in the project root
- `docker-compose.yml` environment sections
- `.docker/compose/*.yml` override files

### Cloud Deployments

For cloud platforms, set environment variables through:

- Platform-specific environment variable interfaces
- Secret management services (AWS Secrets Manager, Azure Key Vault, etc.)
- CI/CD pipeline configuration

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify `DATABASE_URL` format is correct
2. Check database server is running
3. Confirm network connectivity
4. Verify credentials are correct

### JWT Authentication Issues

If authentication fails:

1. Ensure `JWT_SECRET` is set and consistent
2. Check `JWT_EXPIRES_IN` format is valid
3. Verify tokens haven't expired

### AI Features Not Working

If AI features aren't functioning:

1. Verify `GOOGLE_GENAI_API_KEY` is set
2. Check API key is valid and active
3. Ensure you have API quota available

## Related Documentation

- [Deployment Guide](/deployment/)
- [Security Settings](/configuration/security)
- [Backup Configuration](/configuration/backup)
