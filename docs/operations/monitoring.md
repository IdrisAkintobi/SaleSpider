# Monitoring

Monitor your SaleSpider installation for health, performance, and issues.

## Overview

Effective monitoring helps you:

- Detect issues early
- Track performance
- Plan capacity
- Ensure uptime

## Service Monitoring

### Check Service Status

```bash
# All services
make status

# Detailed status
docker-compose ps

# Specific service
docker-compose ps app
```

### Service Health

```bash
# Check health
make health

# Application health endpoint
curl http://localhost:3000/api/health
```

## Log Monitoring

### View Logs

```bash
# All services
make logs

# Specific service
make logs SERVICE=app
make logs SERVICE=postgres

# Follow logs
docker-compose logs -f app
```

### Log Levels

Monitor different log levels:

- **ERROR**: Critical issues
- **WARN**: Potential problems
- **INFO**: General information
- **DEBUG**: Detailed debugging

### Search Logs

```bash
# Search for errors
make logs | grep -i error

# Search for specific pattern
docker-compose logs app | grep "pattern"

# Last 100 lines
docker-compose logs --tail=100 app
```

## Resource Monitoring

### Container Resources

```bash
# Real-time resource usage
docker stats

# Specific container
docker stats salespider-app
```

Monitors:

- CPU usage
- Memory usage
- Network I/O
- Disk I/O

### Disk Usage

```bash
# Check disk space
df -h

# Docker disk usage
docker system df

# Backup storage
du -sh /var/lib/pgbackrest
```

### Memory Usage

```bash
# System memory
free -h

# Container memory
docker stats --no-stream
```

## Database Monitoring

### Connection Count

```bash
# Check active connections
docker-compose exec postgres psql -U postgres -c \
  "SELECT count(*) FROM pg_stat_activity;"
```

### Database Size

```bash
# Check database size
docker-compose exec postgres psql -U postgres -c \
  "SELECT pg_size_pretty(pg_database_size('salespider'));"
```

### Query Performance

```bash
# Slow queries
docker-compose exec postgres psql -U postgres -d salespider -c \
  "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Application Monitoring

### Response Times

Monitor API response times:

- Average response time
- Slow endpoints
- Error rates

### Request Volume

Track request patterns:

- Requests per minute
- Peak hours
- Traffic trends

### Error Tracking

Monitor application errors:

- Error frequency
- Error types
- Stack traces

## Backup Monitoring

### Backup Status

```bash
# Check last backup
make backup-info

# Backup logs
docker-compose logs backup

# Verify backup
docker-compose exec postgres pgbackrest check
```

### Backup Age

Monitor backup freshness:

```bash
# Last backup time
docker-compose exec postgres pgbackrest info | grep "timestamp stop"
```

## Alerts

### Critical Alerts

Monitor for:

- Service down
- Disk space low
- Backup failures
- High error rates

### Warning Alerts

Watch for:

- High CPU usage
- High memory usage
- Slow responses
- Old backups

## Monitoring Tools

### Built-in Tools

**Docker Stats**

```bash
docker stats
```

**Docker Logs**

```bash
docker-compose logs -f
```

**System Tools**

```bash
top
htop
df -h
free -h
```

### External Tools

Consider integrating:

- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Loki** - Log aggregation
- **Alertmanager** - Alert routing

## Metrics to Track

### System Metrics

- CPU usage
- Memory usage
- Disk space
- Network traffic

### Application Metrics

- Request count
- Response times
- Error rates
- Active users

### Database Metrics

- Connection count
- Query performance
- Database size
- Cache hit ratio

### Business Metrics

- Sales per hour
- Active cashiers
- Inventory changes
- User activity

## Health Checks

### Automated Checks

Docker health checks run automatically:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Manual Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec postgres pg_isready

# Service status
make status
```

## Performance Monitoring

### Response Time

Monitor API response times:

```bash
# Test endpoint
time curl http://localhost:3000/api/products
```

### Database Performance

```bash
# Check slow queries
docker-compose exec postgres psql -U postgres -d salespider -c \
  "SELECT * FROM pg_stat_statements WHERE mean_time > 1000;"
```

### Resource Bottlenecks

Identify bottlenecks:

- CPU-bound operations
- Memory constraints
- Disk I/O limits
- Network latency

## Troubleshooting

### High CPU Usage

```bash
# Check processes
docker stats

# Identify culprit
docker top salespider-app
```

### High Memory Usage

```bash
# Check memory
docker stats

# Container memory limit
docker inspect salespider-app | grep Memory
```

### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean logs
docker-compose logs --tail=0
```

## Best Practices

### Regular Monitoring

- Check logs daily
- Review metrics weekly
- Analyze trends monthly
- Test alerts regularly

### Proactive Monitoring

- Set up alerts
- Monitor trends
- Plan capacity
- Document baselines

### Documentation

- Document normal behavior
- Record incidents
- Track changes
- Update runbooks

## Monitoring Checklist

Daily:

- ✅ Check service status
- ✅ Review error logs
- ✅ Verify backups
- ✅ Check disk space

Weekly:

- ✅ Review performance metrics
- ✅ Analyze trends
- ✅ Check resource usage
- ✅ Test alerts

Monthly:

- ✅ Capacity planning
- ✅ Performance review
- ✅ Update documentation
- ✅ Test disaster recovery

## Related Documentation

- [Troubleshooting](/operations/troubleshooting)
- [Backup & Restore](/operations/backup-restore)
- [Makefile Commands](/operations/makefile)
