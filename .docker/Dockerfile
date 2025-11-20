# Multi-stage build for SaleSpider Next.js application
FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client if prisma directory exists
RUN if [ -d "prisma" ]; then \
      npx prisma generate; \
    fi

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install wget for health checks and create user/group
RUN apk add --no-cache wget && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the public folder for static assets
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && \
    chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for migrations (minimal - just schema and generated client)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Create necessary directories
RUN mkdir -p logs uploads && \
    chown -R nextjs:nodejs logs uploads

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check for Next.js
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the server with database migration and seeding
CMD ["sh", "-c", "if [ -d 'prisma' ]; then \
  echo 'Running database migrations...'; \
  npx prisma@6.13.0 migrate deploy || { echo 'ERROR: Migration failed'; exit 1; }; \
  echo 'Migrations completed successfully!'; \
  if [ -z \"$SUPER_ADMIN_EMAIL\" ] || [ -z \"$SUPER_ADMIN_PASSWORD\" ]; then \
    echo 'ERROR: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD environment variables are required for seeding'; \
    exit 1; \
  fi; \
  echo 'Running production seeding...'; \
  npx tsx@4.20.3 prisma/seeds/seed-production.ts || { echo 'WARNING: Seeding failed, but continuing...'; }; \
fi && node server.js"]