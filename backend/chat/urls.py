from django.urls import path
from .views import AIChatRecommendationView, AIChatHistoryView

app_name = 'chat'

urlpatterns = [
    path('recommend/', AIChatRecommendationView.as_view(), name='ai-chat-recommendation'),
    path('history/', AIChatHistoryView.as_view(), name='ai-chat-history'),
]
