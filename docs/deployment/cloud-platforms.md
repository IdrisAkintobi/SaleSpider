# Cloud Platform Deployment

Deploy SaleSpider to popular cloud platforms for scalable, managed hosting.

## Overview

Cloud platform deployment provides:

- Automatic scaling
- Managed infrastructure
- CI/CD integration
- Global CDN
- Zero-downtime deployments

::: tip Automatic Setup
Most platforms automatically run migrations and seeding when using `npm run start:prod`. Vercel requires manual seeding (see below).
:::

## Supported Platforms

- **Vercel** - Best for Next.js applications
- **Railway** - All-in-one with database included
- **Render** - Simple deployments with free tier
- **Fly.io** - Global edge deployment
- **DigitalOcean App Platform** - Managed containers
- Any platform supporting Node.js 24+ and Docker

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub/GitLab/Bitbucket repository
- Hosted PostgreSQL database (Neon, Supabase, etc.)

### Quick Deploy

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**

   ```
   Framework Preset: Next.js
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Set Environment Variables**

   ```bash
   DATABASE_URL=postgresql://user:pass@host/db
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   GOOGLE_GENAI_API_KEY=your-api-key
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   SETUP_BACKUP=false
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access your app at the provided URL

   ::: warning Manual Seeding Required
   Vercel requires one-time manual seeding after first deployment:

   ```bash
   export DATABASE_URL="postgresql://..."
   npm run seed:prod
   ```

   :::

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### Automatic Deployments

Vercel automatically deploys:

- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Railway Deployment

### Prerequisites

- Railway account
- GitHub repository

### Quick Deploy

1. **Create Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub"

2. **Add Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets `DATABASE_URL`

3. **Configure Service**

   ```bash
   # Railway auto-sets DATABASE_URL
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   GOOGLE_GENAI_API_KEY=your-api-key
   NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   SETUP_BACKUP=false
   ```

4. **Set Build Settings**

   ```
   Build Command: npm run build
   Start Command: npm run start:prod
   ```

5. **Deploy**
   - Railway automatically builds and deploys
   - Migrations and seeding run automatically on startup
   - Access via generated railway.app domain

### Custom Domain

1. Go to Settings → Networking
2. Add custom domain
3. Configure DNS CNAME record
4. SSL automatically provisioned

## Render Deployment

### Prerequisites

- Render account
- GitHub/GitLab repository
- Hosted PostgreSQL database

### Quick Deploy

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect repository

2. **Configure Service**

   ```
   Name: salespider
   Environment: Node
   Build Command: npm run build
   Start Command: npm run start:prod
   ```

3. **Set Environment Variables**

   ```bash
   DATABASE_URL=postgresql://user:pass@host/db
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   GOOGLE_GENAI_API_KEY=your-api-key
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   SETUP_BACKUP=false
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Access via onrender.com URL

### Add Database

1. Click "New" → "PostgreSQL"
2. Copy internal connection string
3. Update `DATABASE_URL` in web service

## Fly.io Deployment

### Prerequisites

- Fly.io account
- Fly CLI installed

### Quick Deploy

1. **Install Fly CLI**

   ```bash
   # macOS
   brew install flyctl

   # Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login**

   ```bash
   fly auth login
   ```

3. **Initialize App**

   ```bash
   fly launch
   ```

4. **Set Secrets**

   ```bash
   fly secrets set \
     DATABASE_URL="postgresql://user:pass@host/db" \
     JWT_SECRET="your-secret-key" \
     GOOGLE_GENAI_API_KEY="your-api-key"
   ```

5. **Configure Start Command**

   Create or update `fly.toml`:

   ```toml
   [processes]
   app = "npm run start:prod"
   ```

6. **Deploy**

   ```bash
   fly deploy
   ```

### Add PostgreSQL

```bash
# Create Postgres cluster
fly postgres create

# Attach to app
fly postgres attach <postgres-app-name>
```

## DigitalOcean App Platform

### Prerequisites

- DigitalOcean account
- GitHub repository

### Quick Deploy

1. **Create App**
   - Go to Apps → Create App
   - Connect GitHub repository

2. **Configure Component**

   ```
   Type: Web Service
   Build Command: npm run build
   Run Command: npm run start:prod
   HTTP Port: 3000
   ```

3. **Add Database**
   - Add Component → Database
   - Select PostgreSQL
   - Connection details auto-configured

4. **Set Environment Variables**

   ```bash
   DATABASE_URL=${db.DATABASE_URL}
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   GOOGLE_GENAI_API_KEY=your-api-key
   NEXT_PUBLIC_APP_URL=${APP_URL}
   SETUP_BACKUP=false
   ```

5. **Deploy**
   - Click "Create Resources"
   - Wait for deployment

## Environment Variables

### Required Variables

All platforms need these:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Disable local backups
SETUP_BACKUP=false
PGBACKREST_REPO1_TYPE=none
```

### Optional Variables

```bash
# AI Features
GOOGLE_GENAI_API_KEY=your-api-key

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## Database Setup

### Recommended Providers

For cloud deployments, use:

1. **Neon** - Serverless PostgreSQL
   - Free tier available
   - Automatic scaling
   - Branch databases

2. **Supabase** - PostgreSQL with extras
   - Free tier available
   - Built-in auth (optional)
   - Real-time features

3. **Railway** - Integrated database
   - Included with platform
   - Automatic backups
   - Simple setup

[Learn more about hosted databases →](/deployment/hosted-database)

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "24"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm test

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  script:
    - npm run deploy
  only:
    - main
```

## Monitoring

### Platform Monitoring

Most platforms provide:

- Request logs
- Error tracking
- Performance metrics
- Resource usage

### External Monitoring

Consider adding:

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM and logs
- **New Relic** - Performance monitoring

## Troubleshooting

### Build Failures

```bash
# Check build logs
# Verify Node.js version
# Check environment variables
# Test build locally
npm run build
```

### Runtime Errors

```bash
# Check application logs
# Verify database connection
# Check environment variables
# Test locally with production build
npm run build && npm start
```

### Database Connection Issues

```bash
# Verify DATABASE_URL format
# Check SSL requirements
# Test connection locally
# Check firewall rules
```

## Migration Between Platforms

### Export from Current Platform

1. Export environment variables
2. Backup database
3. Download code (if needed)

### Import to New Platform

1. Create new project
2. Import repository
3. Set environment variables
4. Restore database
5. Deploy

## Comparison

| Feature           | Vercel | Railway   | Render | Fly.io |
| ----------------- | ------ | --------- | ------ | ------ |
| Free Tier         | ✅     | $5 credit | ✅     | ✅     |
| Database Included | ❌     | ✅        | ✅     | ✅     |
| Auto Scaling      | ✅     | ✅        | ✅     | ✅     |
| Custom Domains    | ✅     | ✅        | ✅     | ✅     |
| CI/CD             | ✅     | ✅        | ✅     | ✅     |
| Edge Network      | ✅     | ❌        | ❌     | ✅     |

## Related Documentation

- [Hosted Database Deployment](/deployment/hosted-database)
- [Self-Hosted Deployment](/deployment/self-hosted)
- [Environment Variables](/environment-variables)
- [Deployment Guide](/deployment/)
