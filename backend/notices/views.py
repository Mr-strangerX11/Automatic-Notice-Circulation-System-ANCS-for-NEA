import logging
from datetime import datetime
from django.db import transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Department, Notice, NoticeDistribution, NoticeTracking, ActivityLog
from .serializers import (
    AuthSerializer,
    UserSerializer,
    DepartmentSerializer,
    NoticeSerializer,
    NoticeDistributionSerializer,
    NoticeTrackingSerializer,
)
from .permissions import IsAdmin, IsDepartmentHeadOrAbove
from .notifications import send_email_notice, send_sms_notice, send_push_notice

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        ActivityLog.objects.create(user=request.user, action="created user", notice=None)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()
        return Response(data)


class LogoutView(APIView):
    def post(self, request):
        try:
            token = RefreshToken(request.data.get("refresh"))
            token.blacklist()
        except Exception:  # token may be missing or blacklist disabled
            pass
        return Response({"detail": "Logged out"})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsDepartmentHeadOrAbove]


class NoticeViewSet(viewsets.ModelViewSet):
    queryset = Notice.objects.select_related("created_by", "approved_by").all()
    serializer_class = NoticeSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "tracking"]:
            return [AllowAny()] if self.request.method == "GET" else []
        if self.action in ["approve", "destroy", "update", "partial_update"]:
            return [IsDepartmentHeadOrAbove()]
        return [IsDepartmentHeadOrAbove()]

    def list(self, request, *args, **kwargs):
        queryset = self.queryset.order_by("-created_at")
        department_id = request.query_params.get("department_id")
        if department_id:
            queryset = queryset.filter(distributions__department_id=department_id).distinct()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        notice = serializer.save(created_by=self.request.user, status="pending")
        ActivityLog.objects.create(user=self.request.user, action="created notice", notice=notice)
        return notice

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notice = self.perform_create(serializer)
        return Response(self.get_serializer(notice).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        notice = self.get_object()
        if request.user.is_authenticated:
            tracking, _ = NoticeTracking.objects.get_or_create(user=request.user, notice=notice)
            if not tracking.viewed_at:
                tracking.viewed_at = timezone.now()
                tracking.save()
        return Response(self.get_serializer(notice).data)

    def update(self, request, *args, **kwargs):
        notice = self.get_object()
        serializer = self.get_serializer(notice, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        ActivityLog.objects.create(user=request.user, action="updated notice", notice=notice)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        notice = self.get_object()
        notice.status = "archived"
        notice.save()
        ActivityLog.objects.create(user=request.user, action="archived notice", notice=notice)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        notice = self.get_object()
        department_ids = request.data.get("department_ids") or request.data.get("department_ids[]") or []
        departments = Department.objects.filter(id__in=department_ids)
        with transaction.atomic():
            notice.status = "approved"
            notice.approved_by = request.user
            notice.save()
            sent_status = []
            for dept in departments:
                dist, _ = NoticeDistribution.objects.get_or_create(notice=notice, department=dept)
                recipients = list(User.objects.filter(department=dept).values_list("email", flat=True))
                phones = list(User.objects.filter(department=dept).values_list("phone", flat=True))
                push_tokens = []  # placeholder for stored FCM tokens
                email_result = send_email_notice(f"[NEA Notice] {notice.title}", notice.content, recipients)
                sms_result = send_sms_notice(f"NEA Notice: {notice.title}", phones) if notice.priority in ["high", "urgent"] else {"status": "skipped"}
                push_result = send_push_notice(notice.title, notice.content, push_tokens)
                dist.sent_email = email_result.get("status") == "sent"
                dist.sent_sms = sms_result.get("status") == "sent"
                dist.sent_push = push_result.get("status") == "sent"
                dist.email_status = email_result.get("status")
                dist.sms_status = sms_result.get("status")
                dist.push_status = push_result.get("status")
                dist.save()
                sent_status.append({
                    "department": dept.name,
                    "email": email_result,
                    "sms": sms_result,
                    "push": push_result,
                })
            ActivityLog.objects.create(user=request.user, action="approved notice", notice=notice)
        return Response({"status": "approved", "results": sent_status})

    @action(detail=True, methods=["get"], url_path="tracking")
    def tracking(self, request, pk=None):
        notice = self.get_object()
        tracking = NoticeTracking.objects.filter(notice=notice)
        serializer = NoticeTrackingSerializer(tracking, many=True)
        return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsDepartmentHeadOrAbove])
def admin_dashboard(request):
    total_notices = Notice.objects.count()
    delivered = NoticeDistribution.objects.filter(sent_email=True).count()
    failed = NoticeDistribution.objects.filter(email_status="failed").count()
    urgent = Notice.objects.filter(priority="urgent").count()
    active_departments = Department.objects.count()
    return Response(
        {
            "total_notices": total_notices,
            "delivered_reports": delivered,
            "failed_deliveries": failed,
            "urgent_notices": urgent,
            "active_departments": active_departments,
        }
    )


@api_view(["GET"])
@permission_classes([IsDepartmentHeadOrAbove])
def department_dashboard(request):
    dept_id = request.query_params.get("department_id")
    qs = Notice.objects.all()
    if dept_id:
        qs = qs.filter(distributions__department_id=dept_id)
    recent = qs.order_by("-created_at")[:10]
    unseen = NoticeTracking.objects.filter(viewed_at__isnull=True, user__department_id=dept_id).count()
    downloads = NoticeTracking.objects.filter(downloaded=True, user__department_id=dept_id).count()
    data = {
        "recent": NoticeSerializer(recent, many=True).data,
        "unseen_count": unseen,
        "downloads": downloads,
    }
    return Response(data)


class NotifyEmail(APIView):
    permission_classes = [IsDepartmentHeadOrAbove]

    def post(self, request):
        result = send_email_notice(request.data.get("subject"), request.data.get("body"), request.data.get("recipients", []))
        return Response(result)


class NotifySMS(APIView):
    permission_classes = [IsDepartmentHeadOrAbove]

    def post(self, request):
        result = send_sms_notice(request.data.get("message"), request.data.get("phones", []))
        return Response(result)


class NotifyPush(APIView):
    permission_classes = [IsDepartmentHeadOrAbove]

    def post(self, request):
        result = send_push_notice(request.data.get("title"), request.data.get("body"), request.data.get("tokens", []))
        return Response(result)


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "time": timezone.now().isoformat()})
