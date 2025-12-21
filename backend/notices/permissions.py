from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import User


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)


class IsDepartmentHeadOrAbove(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in [User.Role.ADMIN, User.Role.DEPT_HEAD, User.Role.IT_MANAGER]
        )


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in [User.Role.STAFF, User.Role.SECTION_CHIEF])


class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
