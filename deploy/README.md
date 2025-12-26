# Deployment Scripts

This directory contains scripts to help deploy, monitor, and maintain the ANCS application.

## Scripts Overview

### 🚀 setup.sh
**Purpose**: Initial setup and configuration

**Usage**:
```bash
./deploy/setup.sh
```

**What it does**:
- Creates `.env` and `frontend/.env` from templates
- Generates Django secret key
- Prepares environment for deployment

**When to use**: First time setup, or when resetting configuration

---

### 📦 deploy.sh
**Purpose**: Deploy the application using Docker Compose

**Usage**:
```bash
./deploy/deploy.sh [prod|dev]
```

**Examples**:
```bash
./deploy/deploy.sh prod    # Production deployment
./deploy/deploy.sh dev     # Development deployment
./deploy/deploy.sh         # Defaults to production
```

**What it does**:
- Checks for required files (.env)
- Stops existing containers
- Builds and starts services
- Runs database migrations
- Collects static files
- Shows deployment status

**When to use**: 
- Initial deployment
- After code updates
- When configuration changes

---

### 🏥 health-check.sh
**Purpose**: Quick health check of all services

**Usage**:
```bash
./deploy/health-check.sh
```

**What it checks**:
- Docker container status
- Database connectivity
- Backend API availability
- Frontend availability
- Service HTTP response codes

**When to use**:
- After deployment
- When troubleshooting issues
- As part of monitoring routine

---

### 📊 monitor.sh
**Purpose**: Comprehensive system monitoring

**Usage**:
```bash
./deploy/monitor.sh
```

**What it monitors**:
- System resources (disk, memory)
- Docker container status
- Database size
- Service health
- Recent errors in logs

**When to use**:
- Daily monitoring
- Performance troubleshooting
- Resource planning
- Can be added to cron for automated monitoring

---

### 💾 backup.sh
**Purpose**: Create database backups

**Usage**:
```bash
./deploy/backup.sh
```

**Environment variables** (optional):
```bash
BACKUP_DIR=./backups        # Backup directory (default: ./backups)
RETENTION_DAYS=7            # Keep backups for N days (default: 7)
COMPOSE_FILE=docker-compose.prod.yml  # Docker Compose file to use
```

**Example with options**:
```bash
BACKUP_DIR=/var/backups/ancs RETENTION_DAYS=30 ./deploy/backup.sh
```

**What it does**:
- Creates compressed PostgreSQL dump
- Stores in backup directory with timestamp
- Cleans up old backups (older than retention period)
- Shows backup size and location

**When to use**:
- Before major updates
- Regular scheduled backups (via cron)
- Before risky operations

---

## Complete Deployment Workflow

### First-Time Deployment

1. **Setup environment**:
```bash
./deploy/setup.sh
```

2. **Edit configuration**:
```bash
nano .env
nano frontend/.env
```

3. **Deploy**:
```bash
./deploy/deploy.sh prod
```

4. **Create superuser**:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

5. **Verify deployment**:
```bash
./deploy/health-check.sh
```

### Regular Updates

1. **Pull latest code**:
```bash
git pull origin main
```

2. **Backup database** (recommended):
```bash
./deploy/backup.sh
```

3. **Deploy updates**:
```bash
./deploy/deploy.sh prod
```

4. **Verify**:
```bash
./deploy/health-check.sh
```

### Daily Monitoring

Run daily health monitoring:
```bash
./deploy/monitor.sh
```

Or setup automated monitoring with cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/ancs/deploy/monitor.sh >> /var/log/ancs-monitor.log 2>&1
```

### Weekly Backup

Create weekly backups:
```bash
./deploy/backup.sh
```

Or automate with cron:
```bash
crontab -e
# Add: 0 3 * * 0 /path/to/ancs/deploy/backup.sh >> /var/log/ancs-backup.log 2>&1
```

## Automated Operations

### Setup Cron Jobs

Create a cron schedule for automated operations:

```bash
crontab -e
```

Add these lines:
```cron
# Daily health monitoring at 2 AM
0 2 * * * /path/to/ancs/deploy/monitor.sh >> /var/log/ancs-monitor.log 2>&1

# Weekly backup on Sunday at 3 AM
0 3 * * 0 /path/to/ancs/deploy/backup.sh >> /var/log/ancs-backup.log 2>&1

# Monthly full check on 1st at 4 AM
0 4 1 * * /path/to/ancs/deploy/health-check.sh >> /var/log/ancs-health.log 2>&1
```

## Troubleshooting

### Scripts not executable

```bash
chmod +x deploy/*.sh
```

### Permission denied

```bash
# Run with sudo if needed
sudo ./deploy/deploy.sh prod

# Or fix ownership
sudo chown -R $USER:$USER .
```

### Docker not found

Make sure Docker and Docker Compose are installed:
```bash
docker --version
docker compose version
```

### Environment files missing

Run setup first:
```bash
./deploy/setup.sh
```

## Script Logs

Scripts output to stdout by default. To save logs:

```bash
./deploy/deploy.sh prod > deploy.log 2>&1
./deploy/monitor.sh >> monitor.log 2>&1
./deploy/backup.sh >> backup.log 2>&1
```

## Best Practices

1. **Always backup before major changes**
   ```bash
   ./deploy/backup.sh && ./deploy/deploy.sh prod
   ```

2. **Monitor regularly**
   - Set up cron jobs for automated monitoring
   - Review logs weekly

3. **Test in development first**
   ```bash
   ./deploy/deploy.sh dev
   # Test changes
   ./deploy/deploy.sh prod  # Deploy to production
   ```

4. **Keep backups**
   - Automated weekly backups minimum
   - Test restore procedure quarterly
   - Store critical backups off-server

5. **Document changes**
   - Keep deployment notes
   - Track configuration changes
   - Record troubleshooting steps

## Related Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Complete deployment guide
- [HOSTING_GUIDE.md](../HOSTING_GUIDE.md) - Platform-specific hosting
- [MAINTENANCE.md](../MAINTENANCE.md) - Maintenance procedures
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Quick command reference

## Support

For issues or questions:
- GitHub Issues: https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA/issues
- Email: NEA IT Department
