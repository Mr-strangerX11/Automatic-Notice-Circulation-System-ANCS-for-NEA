from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department, Notice, NoticeDistribution, NoticeTracking, ActivityLog


class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {"fields": ("email", "password", "password_hash")}),
        ("Personal info", {"fields": ("name", "phone", "department", "role")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "phone", "role", "department", "password1", "password2"),
            },
        ),
    )
    list_display = ("email", "name", "role", "department", "is_staff")
    search_fields = ("email", "name")
    ordering = ("email",)


admin.site.register(User, UserAdmin)
admin.site.register(Department)
admin.site.register(Notice)
admin.site.register(NoticeDistribution)
admin.site.register(NoticeTracking)
admin.site.register(ActivityLog)
