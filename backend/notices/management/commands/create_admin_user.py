from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os


class Command(BaseCommand):
    help = "Create an admin user non-interactively using env vars if it does not exist."

    def handle(self, *args, **options):
        email = os.getenv("ADMIN_EMAIL", "admin@nea.local")
        password = os.getenv("ADMIN_PASSWORD")
        name = os.getenv("ADMIN_NAME", "Admin")

        if not password:
            self.stderr.write("ADMIN_PASSWORD env variable is required.")
            raise SystemExit(1)

        User = get_user_model()

        user, created = User.objects.get_or_create(email=email, defaults={
            "name": name,
            "is_staff": True,
            "is_superuser": True,
            "role": User.Role.ADMIN,
        })

        user.set_password(password)
        user.save()

        if created:
            self.stdout.write(f"Admin user created: {email}")
        else:
            self.stdout.write(f"Admin user existed; password updated: {email}")
