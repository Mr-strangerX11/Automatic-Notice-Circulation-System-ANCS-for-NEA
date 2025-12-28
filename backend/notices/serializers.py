from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Department, Notice, NoticeDistribution, NoticeTracking, ActivityLog


class DepartmentSerializer(serializers.ModelSerializer):
    parent_office_name = serializers.CharField(source='parent_office.name', read_only=True)

    class Meta:
        model = Department
        fields = [
            "id",
            "name",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "fax",
            "parent_office",
            "parent_office_name",
            "office_type",
            "province",
            "district",
            "address",
            "photo",
            "head",
        ]


class UserSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True, allow_null=True, required=False
    )
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "role",
            "department",
            "department_id",
            "password",
        ]

    def create(self, validated_data):
        department = validated_data.pop("department", None)
        password = validated_data.pop("password")
        user = User.objects.create(**validated_data, department=department)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        department = validated_data.pop("department", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if department is not None:
            instance.department = department
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class AuthSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        # Use 'username' for Django's ModelBackend; it maps to USERNAME_FIELD (email)
        user = authenticate(username=attrs.get("email"), password=attrs.get("password"))
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        user = validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }


class NoticeSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    department_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)

    class Meta:
        model = Notice
        fields = [
            "id",
            "title",
            "content",
            "priority",
            "file_url",
            "created_by",
            "approved_by",
            "expiry_date",
            "status",
            "created_at",
            "updated_at",
            "department_ids",
        ]


class NoticeDistributionSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = NoticeDistribution
        fields = [
            "notice_id",
            "department",
            "sent_email",
            "sent_sms",
            "sent_push",
            "sent_time",
            "email_status",
            "sms_status",
            "push_status",
        ]


class NoticeTrackingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = NoticeTracking
        fields = ["user", "viewed_at", "downloaded", "download_time"]


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "user", "action", "notice", "created_at"]
