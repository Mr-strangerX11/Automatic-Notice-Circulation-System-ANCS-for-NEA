web: cd backend && python manage.py migrate && gunicorn ancs_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 4
