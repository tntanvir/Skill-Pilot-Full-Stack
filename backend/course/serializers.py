from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Category, Course, Module, Lesson, Enrollment, Payment, CourseReview
from .utils import generate_video_qualities, get_video_embed_url
import urllib.parse
import re


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'course_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']


class LessonSerializer(serializers.ModelSerializer):
    video_url = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True)
    video_qualities = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'module', 'title', 'video_url', 'video_qualities',
            'hls_playlist_url', 'content', 'duration', 'order', 'is_preview', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Include the raw URL so the frontend can display it in edit forms
        ret['raw_video_url'] = instance.video_url
        if not self.is_user_authorized(instance):
            ret['video_url'] = None
        else:
            ret['video_url'] = get_video_embed_url(instance.video_url) if instance.video_url else None
        return ret

    def is_user_authorized(self, obj):
        if obj.is_preview:
            return True

        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False

        user = request.user
        if user.is_staff or user.is_superuser or getattr(user, 'role', '') == 'admin':
            return True

        course = obj.module.course
        if course.mentor == user:
            return True

        if Enrollment.objects.filter(student=user, course=course).exists():
            return True

        return False

    def get_video_qualities(self, obj):
        if not self.is_user_authorized(obj):
            return None
        return generate_video_qualities(obj.video_url, lesson_id=obj.id)


class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order', 'lessons', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    mentor = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default=None)
    enrollment_count = serializers.IntegerField(source='enrollments.count', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'mentor', 'category', 'category_name',
            'thumbnail', 'price', 'level', 'is_published', 'is_completed_by_mentor', 'is_enrolled', 'enrollment_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'mentor', 'created_at', 'updated_at']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return Enrollment.objects.filter(student=request.user, course=obj).exists()

    def get_thumbnail(self, obj):
        if not obj.thumbnail:
            return None
        url_str = str(obj.thumbnail)
        unquoted = urllib.parse.unquote(url_str)
        if "http://" in unquoted or "https://" in unquoted:
            match = re.search(r'https?://[^\s"\']+', unquoted)
            if match:
                return match.group(0)
        request = self.context.get('request')
        if hasattr(obj.thumbnail, 'url'):
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return f"http://127.0.0.1:8000{obj.thumbnail.url}"
        if not url_str.startswith('http') and not url_str.startswith('/'):
            return f"http://127.0.0.1:8000/media/{url_str}"
        return url_str


class CourseDetailSerializer(serializers.ModelSerializer):
    mentor = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    enrollment_count = serializers.IntegerField(source='enrollments.count', read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    completed_lesson_ids = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'mentor', 'category',
            'thumbnail', 'price', 'level', 'is_published', 'is_completed_by_mentor', 'is_enrolled', 'completed_lesson_ids', 'modules',
            'enrollment_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'mentor', 'created_at', 'updated_at']

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        return Enrollment.objects.filter(student=request.user, course=obj).exists()

    def get_completed_lesson_ids(self, obj):
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return []
        
        enrollment = Enrollment.objects.filter(student=request.user, course=obj).first()
        if enrollment:
            return list(enrollment.completed_lessons.values_list('id', flat=True))
        return []

    def get_thumbnail(self, obj):
        if not obj.thumbnail:
            return None
        url_str = str(obj.thumbnail)
        unquoted = urllib.parse.unquote(url_str)
        if "http://" in unquoted or "https://" in unquoted:
            match = re.search(r'https?://[^\s"\']+', unquoted)
            if match:
                return match.group(0)
        request = self.context.get('request')
        if hasattr(obj.thumbnail, 'url'):
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return f"http://127.0.0.1:8000{obj.thumbnail.url}"
        if not url_str.startswith('http') and not url_str.startswith('/'):
            return f"http://127.0.0.1:8000/media/{url_str}"
        return url_str


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'category', 'thumbnail', 'price', 'level', 'is_published', 'is_completed_by_mentor']

    def create(self, validated_data):
        validated_data['mentor'] = self.context['request'].user
        return super().create(validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='course', write_only=True
    )
    student_name = serializers.CharField(source='student.username', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_name', 'student_email', 'course', 'course_id', 'course_title', 'enrolled_at', 'is_completed']
        read_only_fields = ['id', 'student', 'enrolled_at']

    def create(self, validated_data):
        user = self.context['request'].user
        course = validated_data['course']
        if Enrollment.objects.filter(student=user, course=course).exists():
            raise serializers.ValidationError({"course_id": "You are already enrolled in this course."})
        return Enrollment.objects.create(student=user, course=course)


class PaymentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'course', 'course_title', 'stripe_checkout_session_id',
            'stripe_payment_intent_id', 'amount', 'currency', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

class CourseReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseReview
        fields = ['id', 'course', 'course_title', 'student', 'student_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']
