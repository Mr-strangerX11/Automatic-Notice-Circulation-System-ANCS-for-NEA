from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class Department(models.Model):
    OFFICE_TYPE_CHOICES = (
        ("directorate", "Directorate"),
        ("province", "Province"),
        ("province_division", "Province Division"),
        ("division", "Division"),
        ("other", "Other"),
    )

    PROVINCE_CHOICES = (
        ("koshi", "Koshi Province"),
        ("madhesh", "Madhesh Province"),
        ("bagmati", "Bagmati Province"),
        ("gandaki", "Gandaki Province"),
        ("lumbini", "Lumbini Province"),
        ("karnali", "Karnali Province"),
        ("sudurpashchim", "Sudurpashchim Province"),
    )

    # Office info
    name = models.CharField(max_length=255, unique=True, verbose_name="Office Name")
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    fax = models.CharField(max_length=30, blank=True)
    parent_office = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="sub_offices")
    office_type = models.CharField(max_length=50, choices=OFFICE_TYPE_CHOICES, default="other")
    
    # Location
    province = models.CharField(max_length=50, choices=PROVINCE_CHOICES, blank=True)
    district = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    photo = models.URLField(blank=True, verbose_name="Photo URL")
    
    # Legacy field
    head = models.ForeignKey("User", related_name="headed_departments", on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.name


class UserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.ADMIN)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        DEPT_HEAD = "department_head", "Department Head"
        SECTION_CHIEF = "section_chief", "Section Chief"
        STAFF = "staff", "Staff"
        IT_MANAGER = "it_manager", "IT System Manager"

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.STAFF)
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    password_hash = models.CharField(max_length=128)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):  # pragma: no cover - trivial
        return self.email

    def set_password(self, raw_password):
        super().set_password(raw_password)
        self.password_hash = self.password


class Notice(models.Model):
    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("normal", "Normal"),
        ("high", "High"),
        ("urgent", "Urgent"),
    )

    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("archived", "Archived"),
    )

    title = models.CharField(max_length=255)
    content = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="normal")
    file_url = models.URLField(blank=True)
    created_by = models.ForeignKey(User, related_name="created_notices", on_delete=models.CASCADE)
    approved_by = models.ForeignKey(User, related_name="approved_notices", on_delete=models.SET_NULL, null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):  # pragma: no cover - trivial
        return self.title


class NoticeDistribution(models.Model):
    notice = models.ForeignKey(Notice, related_name="distributions", on_delete=models.CASCADE)
    department = models.ForeignKey(Department, related_name="notice_distributions", on_delete=models.CASCADE)
    sent_email = models.BooleanField(default=False)
    sent_sms = models.BooleanField(default=False)
    sent_push = models.BooleanField(default=False)
    sent_time = models.DateTimeField(default=timezone.now)
    email_status = models.CharField(max_length=50, default="pending")
    sms_status = models.CharField(max_length=50, default="pending")
    push_status = models.CharField(max_length=50, default="pending")


class NoticeTracking(models.Model):
    user = models.ForeignKey(User, related_name="notice_tracking", on_delete=models.CASCADE)
    notice = models.ForeignKey(Notice, related_name="tracking", on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(null=True, blank=True)
    downloaded = models.BooleanField(default=False)
    download_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "notice")


class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    notice = models.ForeignKey(Notice, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):  # pragma: no cover - trivial
        return f"{self.created_at}: {self.user} - {self.action}"
