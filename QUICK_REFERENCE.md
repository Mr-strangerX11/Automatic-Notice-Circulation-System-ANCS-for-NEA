# Quick Reference - ANCS Deployment

## 🚀 One-Command Deployment

### Local Development
```bash
./deploy/setup.sh && ./deploy/deploy.sh dev
```

### Production
```bash
./deploy/setup.sh && ./deploy/deploy.sh prod
```

## 📋 Essential Commands

### Setup & Deploy
```bash
./deploy/setup.sh          # Initial setup (creates .env files)
./deploy/deploy.sh prod    # Deploy in production mode
./deploy/deploy.sh dev     # Deploy in development mode
```

### Monitoring & Health
```bash
./deploy/health-check.sh   # Check all services
./deploy/monitor.sh        # Full system monitoring
```

### Backup & Restore
```bash
./deploy/backup.sh         # Create database backup
# Restore: see MAINTENANCE.md
```

### Docker Commands
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop all services
docker compose -f docker-compose.prod.yml down

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Create superuser
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Run migrations
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Django shell
docker compose -f docker-compose.prod.yml exec backend python manage.py shell
```

## 🌐 Platform Deploy Commands

### Railway
```bash
railway login
railway init
railway up
```

### Heroku
```bash
heroku login
heroku create ancs-backend
git push heroku main
heroku run python backend/manage.py migrate
```

### Render
1. Push to GitHub
2. Go to render.com
3. New → Blueprint
4. Select repository

### Vercel (Frontend)
```bash
cd frontend
vercel
```

## 🔐 Environment Variables

### Required Backend Variables
```env
DJANGO_SECRET_KEY=<50-char-random-string>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com
POSTGRES_DB=ancs_db
POSTGRES_USER=ancs_user
POSTGRES_PASSWORD=<secure-password>
POSTGRES_HOST=db
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<email>
SMTP_PASSWORD=<app-password>
FCM_SERVER_KEY=<firebase-key>
```

### Required Frontend Variables
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_FIREBASE_API_KEY=<key>
VITE_FIREBASE_AUTH_DOMAIN=<domain>
VITE_FIREBASE_PROJECT_ID=<id>
VITE_FIREBASE_MESSAGING_SENDER_ID=<id>
VITE_FIREBASE_APP_ID=<id>
VITE_FIREBASE_VAPID_KEY=<key>
```

## 🔍 Troubleshooting Quick Fixes

### Service won't start
```bash
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml restart backend
```

### Database connection issues
```bash
docker compose -f docker-compose.prod.yml restart db
docker compose -f docker-compose.prod.yml exec backend python manage.py check --database default
```

### Clear everything and restart
```bash
docker compose -f docker-compose.prod.yml down -v
./deploy/deploy.sh prod
```

### Check disk space
```bash
df -h
docker system prune -a
```

## 📁 Important Files

- `DEPLOYMENT.md` - Full deployment guide
- `HOSTING_GUIDE.md` - Step-by-step hosting instructions
- `MAINTENANCE.md` - Maintenance procedures
- `docker-compose.prod.yml` - Production Docker configuration
- `.env.example` - Environment template
- `deploy/` - Deployment scripts directory

## 🆘 Getting Help

1. Check logs: `docker compose -f docker-compose.prod.yml logs`
2. Run health check: `./deploy/health-check.sh`
3. See DEPLOYMENT.md troubleshooting section
4. GitHub Issues: [Create Issue](https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA/issues)

## 📊 URLs After Deployment

- Frontend: `http://localhost` or `https://yourdomain.com`
- Backend API: `http://localhost/api` or `https://yourdomain.com/api`
- Admin Panel: `http://localhost/admin` or `https://yourdomain.com/admin`
- API Docs: `http://localhost/api/docs/` (if enabled)

## 🔄 Update Application

```bash
git pull origin main
./deploy/deploy.sh prod
./deploy/health-check.sh
```

## 💾 Backup Schedule

Recommended:
- Daily: Automated health monitoring
- Weekly: Database backup
- Monthly: Full system review

Setup automated backups:
```bash
# Add to crontab
0 3 * * 0 /path/to/ancs/deploy/backup.sh
```

## 🎯 Quick Start Checklist

- [ ] Clone repository
- [ ] Run `./deploy/setup.sh`
- [ ] Edit `.env` files
- [ ] Run `./deploy/deploy.sh prod`
- [ ] Create superuser
- [ ] Test login
- [ ] Configure domain (optional)
- [ ] Setup SSL (optional)
- [ ] Setup backups

---

**Need detailed instructions?** See [HOSTING_GUIDE.md](HOSTING_GUIDE.md)
**Need to maintain the system?** See [MAINTENANCE.md](MAINTENANCE.md)
**Need complete reference?** See [DEPLOYMENT.md](DEPLOYMENT.md)
