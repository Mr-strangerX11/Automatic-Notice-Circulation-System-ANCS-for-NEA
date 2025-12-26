# Hosting Guide - Quick Start for ANCS

This guide provides simplified, step-by-step instructions to host the ANCS application on popular platforms.

## Table of Contents
- [Option 1: Railway (Recommended - Easiest)](#option-1-railway-recommended---easiest)
- [Option 2: Render (Free Tier Available)](#option-2-render-free-tier-available)
- [Option 3: Vercel (Frontend) + Railway (Backend)](#option-3-vercel-frontend--railway-backend)
- [Option 4: Self-Hosted with Docker](#option-4-self-hosted-with-docker)

---

## Option 1: Railway (Recommended - Easiest)

Railway provides the simplest deployment with automatic HTTPS and easy configuration.

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Step 1: Fork or Clone the Repository

If you haven't already:
```bash
git clone https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA.git
cd Automatic-Notice-Circulation-System-ANCS-for-NEA
```

Push to your own GitHub repository if needed.

### Step 2: Deploy Backend on Railway

1. **Go to Railway Dashboard**
   - Visit https://railway.app
   - Click "New Project"

2. **Add PostgreSQL Database**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically provision the database

3. **Deploy Backend Service**
   - Click "New" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect the Django app

4. **Configure Backend Service**
   - Click on the service → "Settings"
   - Set **Root Directory**: `backend`
   - Set **Build Command**: `pip install -r requirements.txt`
   - Set **Start Command**: `python manage.py migrate && gunicorn ancs_backend.wsgi:application --bind 0.0.0.0:$PORT`

5. **Add Environment Variables**
   - Go to "Variables" tab
   - Add these variables:
   ```
   DJANGO_SECRET_KEY=<generate-a-random-50-char-string>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
   POSTGRES_DB=${{POSTGRES_DB}}
   POSTGRES_USER=${{POSTGRES_USER}}
   POSTGRES_PASSWORD=${{POSTGRES_PASSWORD}}
   POSTGRES_HOST=${{POSTGRES_HOST}}
   POSTGRES_PORT=${{POSTGRES_PORT}}
   SMTP_HOST=<your-smtp-host>
   SMTP_PORT=587
   SMTP_USERNAME=<your-smtp-username>
   SMTP_PASSWORD=<your-smtp-password>
   SMTP_USE_TLS=True
   EMAIL_FROM=no-reply@yourdomain.com
   FCM_SERVER_KEY=<your-fcm-key>
   ```
   
   Note: Railway auto-fills PostgreSQL variables when you link the database.

6. **Generate Public Domain**
   - Go to "Settings" tab
   - Click "Generate Domain"
   - Copy the domain (e.g., `your-app.railway.app`)

7. **Create Superuser**
   - Once deployed, open the service
   - Click "..." → "Shell"
   - Run: `python manage.py createsuperuser`

### Step 3: Deploy Frontend on Railway

1. **Create Frontend Service**
   - Click "New" → "GitHub Repo" (same repository)
   - Railway will create a new service

2. **Configure Frontend Service**
   - Click on the service → "Settings"
   - Set **Root Directory**: `frontend`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npx vite preview --host 0.0.0.0 --port $PORT`

3. **Add Environment Variables**
   - Go to "Variables" tab
   - Add:
   ```
   VITE_API_URL=https://<backend-domain>.railway.app/api
   VITE_FIREBASE_API_KEY=<your-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
   VITE_FIREBASE_PROJECT_ID=<your-project-id>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
   VITE_FIREBASE_APP_ID=<your-app-id>
   VITE_FIREBASE_VAPID_KEY=<your-vapid-key>
   ```

4. **Generate Public Domain**
   - Go to "Settings" tab
   - Click "Generate Domain"

### Step 4: Access Your Application

- Frontend: `https://your-frontend.railway.app`
- Backend API: `https://your-backend.railway.app/api`
- Admin Panel: `https://your-backend.railway.app/admin`

**Done! 🎉 Your application is now live!**

---

## Option 2: Render (Free Tier Available)

Render offers a free tier that's perfect for testing and small deployments.

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub.

### Step 2: Deploy Using render.yaml

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Sign in with GitHub

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Select your repository
   - Render will detect `render.yaml` automatically

3. **Configure Services**
   - Render will create:
     - PostgreSQL database
     - Backend web service
     - Frontend static site

4. **Set Environment Variables**
   - For each service, go to "Environment" tab
   - Fill in the required values marked as "sync: false"
   
   **Backend variables:**
   ```
   DJANGO_ALLOWED_HOSTS=your-backend.onrender.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_FROM=no-reply@yourdomain.com
   FCM_SERVER_KEY=your-fcm-key
   ```
   
   **Frontend variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_FIREBASE_API_KEY=your-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_VAPID_KEY=your-vapid-key
   ```

5. **Deploy**
   - Click "Apply" to deploy all services

6. **Create Superuser**
   - Once backend is deployed, go to backend service
   - Click "Shell" tab
   - Run: `python manage.py createsuperuser`

### Step 3: Access Your Application

- Frontend: `https://your-frontend.onrender.com`
- Backend: `https://your-backend.onrender.com/api`
- Admin: `https://your-backend.onrender.com/admin`

**Note:** Free tier services may spin down after inactivity and take 30-60 seconds to start up again.

---

## Option 3: Vercel (Frontend) + Railway (Backend)

This option uses Vercel for the frontend (best performance) and Railway for the backend.

### Step 1: Deploy Backend on Railway

Follow the backend steps from [Option 1](#step-2-deploy-backend-on-railway).

### Step 2: Deploy Frontend on Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your repository
   - Vercel will auto-detect it as a Vite project

3. **Configure Build Settings**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**
   - Add the following:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_FIREBASE_API_KEY=your-key
   VITE_FIREBASE_AUTH_DOMAIN=your-domain
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_VAPID_KEY=your-vapid-key
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

### Step 3: Update Backend CORS Settings

Make sure your backend allows requests from your Vercel domain:

1. Add your Vercel domain to `DJANGO_ALLOWED_HOSTS` in Railway backend environment variables
2. Update CORS settings if you have custom CORS configuration

### Step 4: Access Your Application

- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app/api`

---

## Option 4: Self-Hosted with Docker

For complete control, deploy on your own server (VPS, cloud VM, or local server).

### Prerequisites
- Server with Ubuntu 22.04 (or similar Linux distribution)
- Docker and Docker Compose installed
- Domain name (optional but recommended)

### Step 1: Prepare Your Server

1. **SSH into your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**
   ```bash
   sudo apt update
   sudo apt install docker-compose-plugin
   ```

### Step 2: Clone and Setup the Project

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA.git
   cd Automatic-Notice-Circulation-System-ANCS-for-NEA
   ```

2. **Run setup script**
   ```bash
   ./deploy/setup.sh
   ```

3. **Edit environment files**
   ```bash
   nano .env
   nano frontend/.env
   ```
   
   Update with your production values:
   - Set `DJANGO_DEBUG=False`
   - Set `DJANGO_ALLOWED_HOSTS` to your domain
   - Configure SMTP settings
   - Add Firebase credentials

### Step 3: Deploy with Docker

1. **Deploy in production mode**
   ```bash
   ./deploy/deploy.sh prod
   ```

2. **Create superuser**
   ```bash
   docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
   ```

3. **Check health**
   ```bash
   ./deploy/health-check.sh
   ```

### Step 4: Configure Domain and SSL (Optional)

1. **Point your domain to your server IP**
   - Create an A record in your DNS settings pointing to your server IP

2. **Install Certbot for SSL**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

3. **Get SSL certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

4. **Update nginx configuration**
   - Edit `nginx.prod.conf` to include your SSL certificate paths
   - Restart nginx: `docker compose -f docker-compose.prod.yml restart nginx`

### Step 5: Access Your Application

- Frontend: `http://your-server-ip` or `https://yourdomain.com`
- Backend API: `http://your-server-ip/api` or `https://yourdomain.com/api`
- Admin: `http://your-server-ip/admin` or `https://yourdomain.com/admin`

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Test login functionality
- [ ] Create test users and departments
- [ ] Test notice creation and circulation
- [ ] Verify email notifications are working
- [ ] Test push notifications (if configured)
- [ ] Check file uploads work correctly
- [ ] Verify admin panel access
- [ ] Test API endpoints with Postman
- [ ] Set up regular database backups
- [ ] Configure monitoring (optional)
- [ ] Update DNS records (if using custom domain)
- [ ] Set up SSL/HTTPS (if not automatic)

---

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify database connection (host, port, credentials)
- Check logs: `docker compose logs backend` or platform-specific logs

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in Django
- Ensure backend is accessible from frontend domain

### Email notifications not working
- Verify SMTP credentials
- Check if SMTP port is open (587 or 465)
- For Gmail, use App Passwords, not regular password
- Check spam folder

### Database connection failed
- Verify PostgreSQL is running
- Check database credentials
- Ensure database host is correct
- Check firewall rules

---

## Getting Help

If you encounter issues:

1. Check the logs (platform-specific or Docker logs)
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
3. Check GitHub Issues: https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA/issues
4. Contact NEA IT Department

---

## Cost Estimates (Approximate)

### Railway
- Hobby Plan: $5/month (500 execution hours)
- Pro Plan: $20/month (unlimited)

### Render
- Free Tier: $0 (limited resources, spins down)
- Starter Plan: $7/month per service

### Vercel
- Free Tier: $0 (hobby projects)
- Pro Plan: $20/month

### Self-Hosted
- DigitalOcean Droplet: $6-12/month (2GB RAM)
- AWS EC2 t3.small: ~$15/month
- Domain: $10-15/year

---

## Recommended Setup for NEA

For production use at NEA, we recommend:

**Option A: Cloud Platform (Easiest)**
- Railway Pro ($20/month) - All-in-one, automatic HTTPS, easy management

**Option B: Hybrid (Best Performance)**
- Railway for Backend ($7/month)
- Vercel for Frontend (Free tier)
- Total: $7/month with excellent performance

**Option C: Self-Hosted (Full Control)**
- DigitalOcean Droplet or AWS EC2 ($12-15/month)
- Full control, can scale as needed
- Requires more technical expertise

Choose based on your budget, technical expertise, and control requirements.
