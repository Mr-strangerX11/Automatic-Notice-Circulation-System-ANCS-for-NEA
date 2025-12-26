# Automatic Notice Circulation System (ANCS) for NEA

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/ancs-nea)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA)
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Mr-strangerX11/Automatic-Notice-Circulation-System-ANCS-for-NEA)

Full-stack internal system for uploading a notice once and automatically circulating via email, SMS (mock Sparrow/NTC), push (FCM), and dashboards. Implements JWT auth, RBAC for 5 roles, tracking (seen/unseen/downloads), delivery logs, admin/department dashboards, and a digital noticeboard.

## 🚀 Quick Deploy

Choose your preferred hosting platform:

- **[Railway](https://railway.app)** - Recommended for production (automatic HTTPS, easy setup)
- **[Render](https://render.com)** - Free tier available, great for testing
- **[Heroku](https://heroku.com)** - Click "Deploy to Heroku" button above
- **[Vercel](https://vercel.com)** - Best for frontend only
- **[Docker](./DEPLOYMENT.md#docker-deployment)** - Self-hosted with full control

📖 **See [HOSTING_GUIDE.md](HOSTING_GUIDE.md) for step-by-step instructions**

## Tech Stack
- Backend: Django REST Framework, PostgreSQL, JWT (SimpleJWT), Gunicorn, Nginx
- Frontend: React (Vite), TailwindCSS, React Router, axios, Firebase Messaging (push)
- Notifications: SMTP email, Sparrow/NTC mock SMS, FCM push

## Quick Start (local)
1. Copy env template: `cp .env.example .env` and fill values (DB, SMTP, FCM). For local dev you can skip Postgres by setting `USE_SQLITE=true`.
2. Backend deps:
  - `cd backend`
  - Create or use the workspace venv: `python -m venv ../.venv && source ../.venv/bin/activate`
  - `pip install -r requirements.txt`
3. Migrate and create superuser:
  - `USE_SQLITE=true python manage.py migrate`
  - `USE_SQLITE=true python manage.py createsuperuser --email admin@nea.local --name Admin`
4. Run backend dev server: `DJANGO_DEBUG=true USE_SQLITE=true python manage.py runserver 0.0.0.0:8000`.
5. Frontend: `cd ../frontend && npm install && npm run dev` (Vite on 5173). Set `VITE_API_URL` in `frontend/.env` (e.g., `http://localhost:8000`).

## VS Code Task
Use the built-in task to start both servers:

1. Open Command Palette → "Run Task" → `Run Backend + Frontend`.
2. Backend on `http://0.0.0.0:8000`, Frontend on `http://localhost:5173`.

## Docker (backend, db, nginx)
```bash
docker compose up --build
```
Services: `db` (Postgres 15), `backend` (Gunicorn), `nginx` reverse proxy on port 80.

## API Endpoints
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/register`, `POST /api/auth/refresh`
- Notices: `GET/POST /api/notices`, `GET/PUT/DELETE /api/notices/{id}`, `POST /api/notices/{id}/approve`, `GET /api/notices/{id}/tracking`
- Departments: `GET/POST /api/departments`
- Dashboards: `GET /api/admin/dashboard`, `GET /api/department/dashboard?department_id=`
- Notifications: `POST /api/notify/email|sms|push`

## Database Schema
- `users(id, name, email, phone, role, department_id, password_hash, …)`
- `departments(id, name, first_name, last_name, email, phone_number, fax, office_type, parent_office_id, province, district, address, photo, head_id)`
  - Office types: Directorate, Province, Province Division, Division, Other
  - Provinces: Koshi, Madhesh, Bagmati, Gandaki, Lumbini, Karnali, Sudurpashchim (77 districts total)
  - Hierarchical structure with parent_office for organizational tree
- `notices(id, title, content, priority, file_url, created_by, approved_by, expiry_date, status)`
- `noticedistribution(notice_id, department_id, sent_email, sent_sms, sent_push, sent_time, email_status, sms_status, push_status)`
- `noticetracking(user_id, notice_id, viewed_at, downloaded, download_time)`
- `activitylog(user_id, notice_id, action, created_at)`

## Notifications
- Email: SMTP via Django settings (`SMTP_*` env). HTML email sent per notice.
- SMS: `send_sms_notice` mocks Sparrow/NTC; replace with real HTTP call as needed.
- Push: FCM via `FCM_SERVER_KEY` env; frontend initializes Firebase Messaging and registers service worker `firebase-messaging-sw.js`.

## Frontend Pages
- Auth: Login, Forgot Password
- Admin: Dashboard, Create Notice, Manage Notices (approve/circulate), Archive, Delivery Reports, Department Management, User Management
- Department: Dashboard, View Notices, My Downloads, Acknowledgement
- Notice Detail, Digital Noticeboard (search/filters, priority ribbons)
- Responsive layout + PWA manifest

## Testing
- Backend: run `python manage.py test` (add tests as needed).
- Frontend: Vite build check `npm run build`.

## Deployment

For comprehensive deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**.

### Quick Deploy with Docker

```bash
# Run setup script
./deploy/setup.sh

# Deploy in production mode
./deploy/deploy.sh prod

# Check health
./deploy/health-check.sh
```

### Platform-Specific Deployments

This project includes ready-to-use configurations for:

- **Railway** - One-click deploy with `railway.json`
- **Render** - Auto-deploy with `render.yaml`
- **Heroku** - Deploy with `Procfile` and `app.json`
- **Vercel/Netlify** - Frontend static hosting
- **AWS EC2** - Self-hosted with detailed guide
- **DigitalOcean App Platform** - Managed deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions for each platform.

### CI/CD

GitHub Actions workflows are included for:
- Automated testing on push/PR
- Docker image building
- Code linting

See `.github/workflows/ci.yml` for configuration.

## Deployment Notes
- Backend: build backend image, run with Gunicorn behind Nginx (see `docker-compose.yml` and `nginx.conf`). Set env vars and mount volume for static/media. Run migrations before serving.
- Frontend: `npm run build` then deploy `dist` to Netlify/Vercel; set `VITE_API_URL` env to backend HTTPS URL.
- SSL: terminate at Nginx/hosting provider.

## Postman Collection
See `postman_collection.json` for ready-to-import endpoints with sample payloads.
