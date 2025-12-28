from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    LoginView,
    LogoutView,
    RegisterView,
    NoticeViewSet,
    DepartmentViewSet,
    admin_dashboard,
    department_dashboard,
    NotifyEmail,
    NotifySMS,
    NotifyPush,
    health,
)

router = DefaultRouter()
router.register(r"notices", NoticeViewSet, basename="notice")
router.register(r"departments", DepartmentViewSet, basename="department")

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="login"),
    path("auth/logout", LogoutView.as_view(), name="logout"),
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
    path("admin/dashboard", admin_dashboard, name="admin_dashboard"),
    path("department/dashboard", department_dashboard, name="department_dashboard"),
    path("notify/email", NotifyEmail.as_view(), name="notify_email"),
    path("notify/sms", NotifySMS.as_view(), name="notify_sms"),
    path("notify/push", NotifyPush.as_view(), name="notify_push"),
    path("health", health, name="health"),
]
