# Troubleshooting

Common issues and solutions for SaleSpider.

## Quick Diagnostics

### Check System Status

```bash
# Service status
make status

# View logs
make logs

# Check health
make health
```

## Common Issues

### Services Won't Start

**Symptoms:**

- Containers fail to start
- Services exit immediately
- Port conflicts

**Solutions:**

1. **Check logs:**

   ```bash
   make logs
   docker-compose logs
   ```

2. **Check ports:**

   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :5432
   ```

3. **Restart Docker:**

   ```bash
   # Restart Docker daemon
   sudo systemctl restart docker
   ```

4. **Clean and rebuild:**
   ```bash
   docker-compose down -v
   make deploy
   ```

### Database Connection Errors

**Symptoms:**

- "Connection refused"
- "Could not connect to database"
- Application can't reach database

**Solutions:**

1. **Check database is running:**

   ```bash
   docker-compose ps postgres
   ```

2. **Verify connection string:**

   ```bash
   docker-compose exec app env | grep DATABASE_URL
   ```

3. **Test connection:**

   ```bash
   docker-compose exec postgres psql -U postgres -d salespider
   ```

4. **Check logs:**
   ```bash
   docker-compose logs postgres
   ```

### Application Errors

**Symptoms:**

- 500 Internal Server Error
- Application crashes
- Features not working

**Solutions:**

1. **Check application logs:**

   ```bash
   make logs SERVICE=app
   ```

2. **Verify environment variables:**

   ```bash
   docker-compose exec app env
   ```

3. **Restart application:**

   ```bash
   docker-compose restart app
   ```

4. **Check database migrations:**
   ```bash
   docker-compose exec app npx prisma migrate status
   ```

### Port Conflicts

**Symptoms:**

- "Port already in use"
- "Address already in use"

**Solutions:**

1. **Find process using port:**

   ```bash
   lsof -i :3000
   ```

2. **Kill process:**

   ```bash
   kill -9 <PID>
   ```

3. **Change port:**
   ```yaml
   # In docker-compose.yml
   ports:
     - "3001:3000"
   ```

### Out of Disk Space

**Symptoms:**

- "No space left on device"
- Backups fail
- Services crash

**Solutions:**

1. **Check disk usage:**

   ```bash
   df -h
   ```

2. **Clean Docker:**

   ```bash
   docker system prune -a
   docker volume prune
   ```

3. **Clean logs:**

   ```bash
   docker-compose logs --tail=0
   ```

4. **Remove old backups:**
   ```bash
   docker-compose exec postgres pgbackrest expire --stanza=main
   ```

## Performance Issues

### Slow Response Times

**Symptoms:**

- Pages load slowly
- API requests timeout
- Database queries slow

**Solutions:**

1. **Check resource usage:**

   ```bash
   docker stats
   ```

2. **Check database performance:**

   ```bash
   docker-compose exec postgres psql -U postgres -d salespider -c \
     "SELECT * FROM pg_stat_activity WHERE state = 'active';"
   ```

3. **Restart services:**
   ```bash
   make restart
   ```

### High CPU Usage

**Symptoms:**

- System sluggish
- High load average
- Containers using excessive CPU

**Solutions:**

1. **Identify culprit:**

   ```bash
   docker stats
   docker top salespider-app
   ```

2. **Check for runaway processes:**

   ```bash
   docker-compose logs app | grep -i error
   ```

3. **Restart affected service:**
   ```bash
   docker-compose restart app
   ```

### High Memory Usage

**Symptoms:**

- Out of memory errors
- System swapping
- Containers killed

**Solutions:**

1. **Check memory usage:**

   ```bash
   free -h
   docker stats
   ```

2. **Increase memory limits:**

   ```yaml
   # In docker-compose.yml
   services:
     app:
       mem_limit: 2g
   ```

3. **Restart services:**
   ```bash
   make restart
   ```

## Backup Issues

### Backup Fails

**Symptoms:**

- Backup command fails
- No recent backups
- Backup errors in logs

**Solutions:**

1. **Check backup logs:**

   ```bash
   docker-compose logs backup
   cat /var/log/pgbackrest/main-backup.log
   ```

2. **Verify disk space:**

   ```bash
   df -h /var/lib/pgbackrest
   ```

3. **Check permissions:**

   ```bash
   ls -la /var/lib/pgbackrest
   ```

4. **Manual backup:**
   ```bash
   make backup
   ```

### Restore Fails

**Symptoms:**

- Restore command fails
- Database not restored
- Data missing after restore

**Solutions:**

1. **Verify backup exists:**

   ```bash
   make backup-info
   ```

2. **Check restore logs:**

   ```bash
   cat /var/log/pgbackrest/main-restore.log
   ```

3. **Try different backup:**
   ```bash
   docker-compose exec postgres pgbackrest info
   ```

## Docker Issues

### Docker Daemon Not Running

**Symptoms:**

- "Cannot connect to Docker daemon"
- Docker commands fail

**Solutions:**

1. **Start Docker:**

   ```bash
   sudo systemctl start docker
   ```

2. **Check Docker status:**

   ```bash
   sudo systemctl status docker
   ```

3. **Restart Docker:**
   ```bash
   sudo systemctl restart docker
   ```

### Container Keeps Restarting

**Symptoms:**

- Container in restart loop
- Services unstable

**Solutions:**

1. **Check logs:**

   ```bash
   docker-compose logs <service>
   ```

2. **Check health:**

   ```bash
   docker inspect <container> | grep Health
   ```

3. **Remove and recreate:**
   ```bash
   docker-compose rm <service>
   docker-compose up -d <service>
   ```

## Network Issues

### Cannot Access Application

**Symptoms:**

- Cannot reach application URL
- Connection timeout
- DNS errors

**Solutions:**

1. **Check services are running:**

   ```bash
   make status
   ```

2. **Verify ports:**

   ```bash
   docker-compose ps
   ```

3. **Check firewall:**

   ```bash
   sudo ufw status
   ```

4. **Test locally:**
   ```bash
   curl http://localhost:3000
   ```

### SSL Certificate Errors

**Symptoms:**

- "Certificate not trusted"
- "SSL handshake failed"
- Browser warnings

**Solutions:**

1. **Regenerate certificates:**

   ```bash
   rm -rf .docker/ssl
   make deploy
   ```

2. **Install certificate:**
   - Export certificate
   - Install in system trust store

3. **Use HTTP for testing:**
   ```bash
   http://localhost:3000
   ```

## Authentication Issues

### Cannot Login

**Symptoms:**

- Login fails
- "Invalid credentials"
- Session expires immediately
- No users exist in database

**Solutions:**

1. **Check if database was seeded:**

   ```bash
   # Check if super admin exists
   docker-compose exec postgres psql -U postgres -d salespider -c \
     "SELECT email, role FROM \"User\" WHERE role = 'SUPER_ADMIN';"
   ```

   If no results, seed the database:

   ```bash
   # Self-hosted
   docker-compose exec app npm run seed

   # Cloud/production
   npm run seed:prod
   ```

2. **Verify credentials:**
   - Check username/email matches SUPER_ADMIN_EMAIL in .env
   - Check password matches SUPER_ADMIN_PASSWORD in .env

3. **Check JWT configuration:**

   ```bash
   docker-compose exec app env | grep JWT
   ```

4. **Clear browser cache:**
   - Clear cookies
   - Try incognito mode

5. **Check logs:**
   ```bash
   make logs SERVICE=app | grep auth
   ```

### Permission Denied

**Symptoms:**

- "Access denied"
- "Insufficient permissions"
- Features not accessible

**Solutions:**

1. **Check user role:**
   - Verify user has correct role
   - Check role permissions

2. **Check logs:**
   ```bash
   make logs SERVICE=app | grep permission
   ```

## Migration Issues

### Migration Fails

**Symptoms:**

- Migration command fails
- Database schema outdated
- Application errors

**Solutions:**

1. **Check migration status:**

   ```bash
   docker-compose exec app npx prisma migrate status
   ```

2. **Run migrations:**

   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

3. **Reset if needed:**
   ```bash
   docker-compose exec app npx prisma migrate reset
   ```

## Getting Help

### Collect Information

Before seeking help, gather:

1. **System information:**

   ```bash
   uname -a
   docker --version
   docker-compose --version
   ```

2. **Service status:**

   ```bash
   make status
   ```

3. **Logs:**

   ```bash
   make logs > logs.txt
   ```

4. **Configuration:**
   ```bash
   docker-compose config > config.yml
   ```

### Support Channels

- Check documentation
- Review GitHub issues
- Ask in community forums
- Contact support

## Prevention

### Regular Maintenance

- Monitor logs daily
- Check backups weekly
- Update regularly
- Test disaster recovery

### Best Practices

- Keep backups current
- Monitor disk space
- Review logs regularly
- Document changes

## Related Documentation

- [Monitoring](/operations/monitoring)
- [Backup & Restore](/operations/backup-restore)
- [Makefile Commands](/operations/makefile)
