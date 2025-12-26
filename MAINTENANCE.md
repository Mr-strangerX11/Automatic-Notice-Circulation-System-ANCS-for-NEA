# Maintenance Guide - ANCS for NEA

This guide covers routine maintenance tasks for the ANCS application.

## Daily Tasks

### 1. Health Monitoring

Run the monitoring script daily to check system health:

```bash
./deploy/monitor.sh
```

This checks:
- Service availability
- Disk space
- Memory usage
- Container status
- Database size
- Recent errors

### 2. Log Review

Check application logs for errors:

**Docker deployment:**
```bash
# Backend logs
docker compose -f docker-compose.prod.yml logs --tail=100 backend

# Frontend logs
docker compose -f docker-compose.prod.yml logs --tail=100 frontend

# Database logs
docker compose -f docker-compose.prod.yml logs --tail=100 db

# All logs
docker compose -f docker-compose.prod.yml logs --tail=100
```

**Platform-specific:**
- Railway: Check logs in dashboard
- Render: View logs in service page
- Heroku: `heroku logs --tail`

## Weekly Tasks

### 1. Database Backup

Create a backup of the database:

```bash
./deploy/backup.sh
```

Backups are stored in `./backups/` directory with automatic cleanup after 7 days.

**Manual backup:**
```bash
# Docker
docker compose -f docker-compose.prod.yml exec db pg_dump -U ancs_user ancs_db > backup_$(date +%Y%m%d).sql

# Direct PostgreSQL
pg_dump -h localhost -U ancs_user ancs_db > backup_$(date +%Y%m%d).sql
```

### 2. Review System Resources

Check if resources need scaling:

```bash
# Check container resource usage
docker stats

# Check disk usage
df -h

# Check memory usage
free -h
```

### 3. Check for Failed Notifications

Review notification logs to ensure emails, SMS, and push notifications are being delivered:

```bash
# Check Django admin panel
# Go to: https://your-domain.com/admin
# Review: Notice Distribution and Activity Logs
```

## Monthly Tasks

### 1. Update Dependencies

Check for security updates:

**Backend:**
```bash
cd backend
pip list --outdated
# Update specific packages
pip install --upgrade package-name
# Update requirements.txt
pip freeze > requirements.txt
```

**Frontend:**
```bash
cd frontend
npm outdated
# Update packages
npm update
# Or update specific package
npm install package-name@latest
```

### 2. Clean Up Old Data

Archive or delete old notices that are past their expiry date:

```bash
# Via Django admin panel or custom management command
docker compose -f docker-compose.prod.yml exec backend python manage.py shell
```

In Django shell:
```python
from notices.models import Notice
from datetime import datetime, timedelta

# Find expired notices older than 6 months
six_months_ago = datetime.now() - timedelta(days=180)
old_notices = Notice.objects.filter(expiry_date__lt=six_months_ago)

# Archive or delete as needed
old_notices.update(archived=True)
```

### 3. Review User Accounts

Check for inactive users or suspended accounts:

```bash
# Via Django admin panel
# https://your-domain.com/admin/auth/user/
```

### 4. Database Maintenance

Optimize database performance:

**PostgreSQL:**
```bash
# Docker
docker compose -f docker-compose.prod.yml exec db psql -U ancs_user -d ancs_db -c "VACUUM ANALYZE;"

# Direct
psql -h localhost -U ancs_user -d ancs_db -c "VACUUM ANALYZE;"
```

## Quarterly Tasks

### 1. Security Audit

Review security settings and update secrets:

- [ ] Rotate Django SECRET_KEY
- [ ] Review and update ALLOWED_HOSTS
- [ ] Check SSL certificate expiry
- [ ] Review user permissions and roles
- [ ] Update firewall rules if needed
- [ ] Review CORS settings

### 2. Performance Review

Analyze application performance:

- [ ] Review database query performance
- [ ] Check API response times
- [ ] Analyze frontend loading times
- [ ] Review and optimize slow queries
- [ ] Check for N+1 query problems

### 3. Backup Testing

Test backup restoration:

```bash
# 1. Create a test database
docker compose -f docker-compose.prod.yml exec db createdb -U ancs_user test_restore

# 2. Restore latest backup
gunzip -c backups/latest_backup.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U ancs_user test_restore

# 3. Verify data integrity
docker compose -f docker-compose.prod.yml exec db psql -U ancs_user test_restore -c "SELECT COUNT(*) FROM notices;"

# 4. Drop test database
docker compose -f docker-compose.prod.yml exec db dropdb -U ancs_user test_restore
```

## As-Needed Tasks

### Update Application Code

When deploying new features or bug fixes:

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart services
./deploy/deploy.sh prod

# 3. Check health
./deploy/health-check.sh
```

### Scale Services

If experiencing high traffic:

**Docker (increase workers):**

Edit `docker-compose.prod.yml`:
```yaml
backend:
  command: gunicorn ancs_backend.wsgi:application --bind 0.0.0.0:8000 --workers 8
```

Then restart:
```bash
docker compose -f docker-compose.prod.yml up -d --build backend
```

**Platform-specific:**
- Railway: Increase resources in service settings
- Render: Upgrade to higher tier plan
- Heroku: Scale dynos: `heroku ps:scale web=2`

### Database Migration

When schema changes are needed:

```bash
# 1. Create migration
docker compose -f docker-compose.prod.yml exec backend python manage.py makemigrations

# 2. Review migration file
docker compose -f docker-compose.prod.yml exec backend python manage.py sqlmigrate notices 0001

# 3. Apply migration
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# 4. Verify
docker compose -f docker-compose.prod.yml exec backend python manage.py showmigrations
```

### Restore from Backup

In case of data loss or corruption:

```bash
# 1. Stop services
docker compose -f docker-compose.prod.yml down

# 2. Start only database
docker compose -f docker-compose.prod.yml up -d db

# 3. Wait for database to be ready
sleep 10

# 4. Drop existing database (WARNING: This deletes all data!)
docker compose -f docker-compose.prod.yml exec db dropdb -U ancs_user ancs_db

# 5. Create fresh database
docker compose -f docker-compose.prod.yml exec db createdb -U ancs_user ancs_db

# 6. Restore from backup
gunzip -c backups/ancs_backup_YYYYMMDD_HHMMSS.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U ancs_user ancs_db

# 7. Start all services
docker compose -f docker-compose.prod.yml up -d

# 8. Verify restoration
./deploy/health-check.sh
```

## Automated Maintenance

### Setup Cron Jobs

For automated maintenance tasks, add to crontab:

```bash
crontab -e
```

Add these lines:
```cron
# Daily health check at 2 AM
0 2 * * * /path/to/ancs/deploy/monitor.sh >> /var/log/ancs-monitor.log 2>&1

# Weekly backup on Sunday at 3 AM
0 3 * * 0 /path/to/ancs/deploy/backup.sh >> /var/log/ancs-backup.log 2>&1

# Monthly cleanup of old logs on 1st of month at 4 AM
0 4 1 * * find /var/log/ancs-*.log -mtime +90 -delete

# Daily log rotation at 1 AM
0 1 * * * docker compose -f /path/to/ancs/docker-compose.prod.yml logs --tail=1000 > /var/log/ancs-daily.log 2>&1
```

### Setup Log Rotation

Create `/etc/logrotate.d/ancs`:

```
/var/log/ancs-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

## Monitoring Best Practices

1. **Set up alerts** for critical issues:
   - Disk space below 20%
   - Memory usage above 85%
   - Service downtime
   - Database connection failures

2. **Track metrics** over time:
   - Number of notices created per day
   - Notification delivery success rate
   - API response times
   - Database size growth

3. **Keep logs** for at least 30 days for troubleshooting

4. **Test backups** regularly (monthly recommended)

5. **Document incidents** and resolutions for future reference

## Troubleshooting Common Issues

### High Memory Usage

```bash
# Restart services
docker compose -f docker-compose.prod.yml restart

# Reduce Gunicorn workers
# Edit docker-compose.prod.yml and reduce --workers value
```

### Slow Database Queries

```bash
# Enable query logging
docker compose -f docker-compose.prod.yml exec db psql -U ancs_user -d ancs_db
# ALTER SYSTEM SET log_statement = 'all';
# SELECT pg_reload_conf();

# Check slow queries in logs
docker compose -f docker-compose.prod.yml logs db | grep "duration:"
```

### Full Disk

```bash
# Clean up old Docker images
docker system prune -a

# Clean up old backups
rm backups/ancs_backup_old*.sql.gz

# Clean up logs
truncate -s 0 /var/log/ancs-*.log
```

### Service Not Starting

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker compose -f docker-compose.prod.yml config

# Restart services
docker compose -f docker-compose.prod.yml restart
```

## Support Contacts

For issues requiring assistance:

- **Technical Support**: NEA IT Department
- **Application Issues**: GitHub Issues
- **Emergency**: Contact system administrator

## Checklist Template

Use this checklist for routine maintenance:

### Weekly Maintenance Checklist
- [ ] Run health monitoring script
- [ ] Review logs for errors
- [ ] Create database backup
- [ ] Verify backup completed successfully
- [ ] Check disk space usage
- [ ] Review notification delivery logs
- [ ] Check for failed jobs or tasks

### Monthly Maintenance Checklist
- [ ] Update dependencies
- [ ] Clean up old/expired notices
- [ ] Review user accounts
- [ ] Run database optimization (VACUUM)
- [ ] Review system resource usage
- [ ] Check for security updates
- [ ] Test backup restoration

### Quarterly Maintenance Checklist
- [ ] Security audit
- [ ] Performance review
- [ ] Update SSL certificates (if needed)
- [ ] Review and update documentation
- [ ] Disaster recovery plan review
- [ ] User training (if needed)
