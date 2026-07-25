from django.contrib import admin
from .models import ChatMessage


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session_id', 'user_skills', 'target_goal', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'session_id', 'user_message', 'bot_response', 'user_skills', 'target_goal')
    readonly_fields = ('created_at',)
    filter_horizontal = ('recommended_courses',)
