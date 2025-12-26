# Deployment Guide - ANCS for NEA

This guide covers deploying the Automatic Notice Circulation System (ANCS) for Nepal Electricity Authority to various hosting platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Platform-Specific Deployments](#platform-specific-deployments)
  - [Railway](#railway)
  - [Render](#render)
  - [Heroku](#heroku)
  - [DigitalOcean App Platform](#digitalocean-app-platform)
  - [AWS (EC2 + RDS)](#aws-ec2--rds)
  - [Vercel (Frontend Only)](#vercel-frontend-only)
  - [Netlify (Frontend Only)](#netlify-frontend-only)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deployment, ensure you have:
- Git installed
- Docker and Docker Compose (for containerized deployment)
- Node.js 18+ and npm (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 15+ (for production database)
- SMTP credentials (for email notifications)
- Firebase Cloud Messaging credentials (for push notifications)
- Domain name (optional but recommended for production)

## Environment Variables

### Backend (.env)

Create a `.env` file in the project root with these variables:

```env
# Django
DJANGO_SECRET_KEY=your-super-secret-key-change-in-production
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
POSTGRES_DB=ancs_db
POSTGRES_USER=ancs_user
POSTGRES_PASSWORD=your-secure-password
POSTGRES_HOST=db
POSTGRES_PORT=5432

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=True
EMAIL_FROM=no-reply@yourdomain.com

# FCM (Push Notifications)
FCM_SERVER_KEY=your-fcm-server-key
```

### Frontend (.env)

Create a `frontend/.env` file:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

## Local Development

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA.git
cd Automatic-Notice-Circulation-System-ANCS-for-NEA
```

2. Copy environment files:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

3. Edit `.env` and `frontend/.env` with your configuration.

4. Run with Docker:
```bash
docker compose up --build
```

Or run locally:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin: http://localhost:8000/admin

## Docker Deployment

### Production Docker Setup

1. Use the production docker-compose file:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

2. Run migrations:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

3. Create superuser:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

4. Collect static files:
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### Docker Compose Services

- **db**: PostgreSQL 15 database
- **backend**: Django REST API with Gunicorn
- **frontend**: React app built with Vite
- **nginx**: Reverse proxy and static file server

## Platform-Specific Deployments

### Railway

Railway is recommended for easy deployment with automatic HTTPS.

#### Backend Deployment

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and create project:
```bash
railway login
railway init
```

3. Add PostgreSQL:
```bash
railway add postgresql
```

4. Set environment variables in Railway dashboard or via CLI:
```bash
railway variables set DJANGO_SECRET_KEY=your-secret-key
railway variables set DJANGO_DEBUG=False
railway variables set DJANGO_ALLOWED_HOSTS=your-app.railway.app
# Add other variables from .env.example
```

5. Deploy backend:
```bash
cd backend
railway up
```

6. Run migrations:
```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

#### Frontend Deployment

1. Create new Railway service for frontend
2. Set build command: `cd frontend && npm install && npm run build`
3. Set start command: `cd frontend && npm run preview`
4. Set environment variables:
```bash
railway variables set VITE_API_URL=https://your-backend.railway.app/api
# Add other Firebase variables
```

### Render

#### Backend Deployment

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set the following:
   - **Name**: ancs-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3.11
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn ancs_backend.wsgi:application --bind 0.0.0.0:$PORT`

4. Add a PostgreSQL database:
   - Go to **Dashboard** → **New** → **PostgreSQL**
   - Link it to your web service

5. Add environment variables in Render dashboard (use the provided DATABASE_URL)

6. After deployment, run migrations:
```bash
# In Render shell
python manage.py migrate
python manage.py createsuperuser
```

#### Frontend Deployment

1. Create a new **Static Site** on Render
2. Set:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
3. Add environment variables

### Heroku

1. Install Heroku CLI:
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. Login and create app:
```bash
heroku login
heroku create ancs-backend
```

3. Add PostgreSQL:
```bash
heroku addons:create heroku-postgresql:mini
```

4. Set environment variables:
```bash
heroku config:set DJANGO_SECRET_KEY=your-secret-key
heroku config:set DJANGO_DEBUG=False
# Add other variables
```

5. Deploy:
```bash
git push heroku main
```

6. Run migrations:
```bash
heroku run python backend/manage.py migrate
heroku run python backend/manage.py createsuperuser
```

### DigitalOcean App Platform

1. Create a new App on DigitalOcean
2. Connect your GitHub repository
3. Configure components:

**Backend Component:**
- Type: Web Service
- Source Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Run Command: `gunicorn ancs_backend.wsgi:application --bind 0.0.0.0:8080`
- HTTP Port: 8080

**Database Component:**
- Type: PostgreSQL
- Version: 15

**Frontend Component:**
- Type: Static Site
- Source Directory: `frontend`
- Build Command: `npm install && npm run build`
- Output Directory: `dist`

4. Add environment variables in the App Platform dashboard

### AWS (EC2 + RDS)

#### 1. Setup RDS PostgreSQL

1. Create RDS PostgreSQL 15 instance
2. Note the endpoint, username, and password

#### 2. Setup EC2 Instance

1. Launch Ubuntu 22.04 EC2 instance (t2.medium or larger)
2. Configure Security Groups:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere

3. SSH into instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

4. Install dependencies:
```bash
sudo apt update
sudo apt install -y python3-pip python3-venv nginx postgresql-client nodejs npm git
```

5. Clone repository:
```bash
cd /var/www
sudo git clone https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA.git ancs
sudo chown -R ubuntu:ubuntu ancs
cd ancs
```

6. Setup backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt gunicorn
```

7. Create .env file with RDS credentials

8. Run migrations:
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

9. Setup Gunicorn service:
```bash
sudo nano /etc/systemd/system/ancs.service
```

Add:
```ini
[Unit]
Description=ANCS Gunicorn
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/ancs/backend
Environment="PATH=/var/www/ancs/backend/venv/bin"
ExecStart=/var/www/ancs/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/ancs/ancs.sock ancs_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

10. Start service:
```bash
sudo systemctl start ancs
sudo systemctl enable ancs
```

11. Configure Nginx:
```bash
sudo nano /etc/nginx/sites-available/ancs
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /static/ {
        alias /var/www/ancs/backend/staticfiles/;
    }

    location /media/ {
        alias /var/www/ancs/backend/media/;
    }

    location /api/ {
        proxy_pass http://unix:/var/www/ancs/ancs.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/ancs/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

12. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ancs /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

13. Build frontend:
```bash
cd /var/www/ancs/frontend
npm install
npm run build
```

### Vercel (Frontend Only)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard

4. Update build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Netlify (Frontend Only)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login and deploy:
```bash
cd frontend
netlify login
netlify init
netlify deploy --prod
```

3. Configure build settings in `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

For self-hosted deployments on EC2, DigitalOcean Droplets, etc.:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will automatically configure Nginx and set up auto-renewal.

### Using Platform SSL

Most platforms (Railway, Render, Vercel, Netlify) provide automatic SSL certificates. Just add your custom domain in the platform dashboard.

## Monitoring and Maintenance

### Health Checks

The deployment includes a health check script at `/deploy/health-check.sh`:

```bash
./deploy/health-check.sh
```

### Logs

**Docker:**
```bash
docker compose logs -f backend
docker compose logs -f nginx
```

**Systemd (EC2):**
```bash
sudo journalctl -u ancs -f
```

**Platform Logs:**
- Railway: `railway logs`
- Render: Available in dashboard
- Heroku: `heroku logs --tail`

### Database Backups

**PostgreSQL:**
```bash
# Backup
pg_dump -h localhost -U ancs_user ancs_db > backup.sql

# Restore
psql -h localhost -U ancs_user ancs_db < backup.sql
```

**Docker:**
```bash
docker compose exec db pg_dump -U ancs_user ancs_db > backup.sql
```

### Updates and Migrations

1. Pull latest code:
```bash
git pull origin main
```

2. Rebuild and restart:
```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

3. For systemd deployments:
```bash
cd /var/www/ancs
git pull
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart ancs
```

## Security Checklist

- [ ] Set `DJANGO_DEBUG=False` in production
- [ ] Use strong `DJANGO_SECRET_KEY`
- [ ] Configure `DJANGO_ALLOWED_HOSTS` properly
- [ ] Use strong database passwords
- [ ] Enable SSL/HTTPS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs for suspicious activity

## Troubleshooting

### Database Connection Issues
- Verify `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- Check firewall rules
- Ensure PostgreSQL is running

### Static Files Not Loading
```bash
python manage.py collectstatic --noinput
```

### CORS Errors
Add your frontend domain to `CORS_ALLOWED_ORIGINS` in Django settings

### Email Not Sending
- Verify SMTP credentials
- Check if port 587/465 is open
- For Gmail, use App Passwords

## Support

For issues and questions:
- GitHub Issues: https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA/issues
- Email: Contact NEA IT Department

## License

Proprietary - Nepal Electricity Authority
