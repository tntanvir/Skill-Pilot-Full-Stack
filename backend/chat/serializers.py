from rest_framework import serializers
from course.serializers import CourseListSerializer
from .models import ChatMessage


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(
        required=True,
        help_text="User message describing their skills, background, or career goals."
    )
    session_id = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
        help_text="Optional session ID for guest users or conversation tracking"
    )


class ChatMessageSerializer(serializers.ModelSerializer):
    recommended_courses = CourseListSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True, default=None)

    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'user',
            'user_email',
            'session_id',
            'user_message',
            'bot_response',
            'user_skills',
            'target_goal',
            'recommended_courses',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']
