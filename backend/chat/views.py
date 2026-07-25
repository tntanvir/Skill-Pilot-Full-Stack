import uuid
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse

from course.models import Course
from .models import ChatMessage
from .serializers import AIChatRequestSerializer, ChatMessageSerializer
from .services import GeminiCourseAdvisor


class AIChatRecommendationView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="AI Career Counselor & Course Recommendation Bot",
        description="Chats with Google Gemini AI to analyze user skills & target goals and recommends active database courses.",
        request=AIChatRequestSerializer,
        responses={200: ChatMessageSerializer}
    )
    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user_message = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id') or str(uuid.uuid4())

        # Generate recommendation using Gemini AI & Database Matching
        bot_response, course_ids, detected_skills, detected_goal = GeminiCourseAdvisor.generate_recommendation(
            user_message=user_message
        )

        user = request.user if request.user and request.user.is_authenticated else None

        # Save conversation to database
        chat_msg = ChatMessage.objects.create(
            user=user,
            session_id=session_id,
            user_message=user_message,
            bot_response=bot_response,
            user_skills=detected_skills,
            target_goal=detected_goal
        )

        # Attach recommended courses
        if course_ids:
            matching_courses = Course.objects.filter(id__in=course_ids, is_published=True)
            chat_msg.recommended_courses.set(matching_courses)

        output_serializer = ChatMessageSerializer(chat_msg, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_200_OK)


class AIChatHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatMessageSerializer

    @extend_schema(
        summary="User AI Chat History",
        description="Returns conversation history for the authenticated user."
    )
    def get_queryset(self):
        return ChatMessage.objects.filter(user=self.request.user).order_by('-created_at')
