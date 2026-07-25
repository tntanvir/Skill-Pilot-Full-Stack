from django.db import models
from django.conf import settings


class ChatMessage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='chat_messages'
    )
    session_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    user_skills = models.CharField(max_length=255, blank=True, null=True)
    target_goal = models.CharField(max_length=255, blank=True, null=True)
    recommended_courses = models.ManyToManyField(
        'course.Course',
        blank=True,
        related_name='chat_recommendations'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        user_str = self.user.email if self.user else f"Guest ({self.session_id or 'anon'})"
        return f"Chat by {user_str} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
