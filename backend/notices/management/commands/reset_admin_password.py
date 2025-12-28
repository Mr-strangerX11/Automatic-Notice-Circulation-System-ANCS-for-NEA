from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = "Reset the admin user's password non-interactively using env vars."

    def handle(self, *args, **options):
        email = os.getenv("ADMIN_EMAIL", "admin@nea.local")
        password = os.getenv("ADMIN_PASSWORD")

        if not password:
            self.stderr.write("ADMIN_PASSWORD env variable is required.")
            raise SystemExit(1)

        User = get_user_model()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stderr.write(f"User with email {email} not found. Create it first with createsuperuser.")
            raise SystemExit(1)

        user.set_password(password)
        user.save()
        self.stdout.write(f"Password updated for {email}.")
