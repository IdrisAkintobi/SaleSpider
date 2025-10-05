# Use PostgreSQL 17 Alpine base image
FROM postgres:17-alpine

# Switch to root so we can install packages
USER root

# Install pgBackRest
RUN apk add --no-cache pgbackrest

# Create necessary directories with proper ownership
RUN mkdir -p /var/lib/pgbackrest /var/log/pgbackrest \
    && chown -R postgres:postgres /var/lib/pgbackrest /var/log/pgbackrest

# Switch back to postgres user (required by official entrypoint)
USER postgres

# Default workdir
WORKDIR /var/lib/postgresql/data
