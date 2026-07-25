import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import Category, Course, Module, Lesson, Enrollment, Payment, LearningActivity, CourseReview
from .serializers import (
    CategorySerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    CourseCreateUpdateSerializer,
    ModuleSerializer,
    LessonSerializer,
    EnrollmentSerializer,
    PaymentSerializer,
    CourseReviewSerializer,
)
from .permissions import IsMentorOrAdminOrReadOnly, IsCourseOwnerOrAdmin
from .pagination import CoursePagination

User = get_user_model()
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsMentorOrAdminOrReadOnly]
    lookup_field = 'slug'


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    permission_classes = [IsMentorOrAdminOrReadOnly, IsCourseOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'category__name', 'level', 'mentor', 'is_published']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'price']
    lookup_field = 'slug'
    pagination_class = CoursePagination

    def get_queryset(self):
        user = self.request.user
        if self.action in ['list', 'retrieve']:
            if user.is_authenticated and (user.is_staff or user.role in ['mentor', 'admin']):
                return Course.objects.all()
            return Course.objects.filter(is_published=True)
        return Course.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        elif self.action == 'retrieve':
            return CourseDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseDetailSerializer

    @extend_schema(
        summary="Enroll in a Course",
        description="Enroll the currently authenticated user in this course.",
        request=None,
        responses={
            201: EnrollmentSerializer,
            400: OpenApiResponse(description="Already enrolled or invalid request."),
            401: OpenApiResponse(description="Unauthorized."),
        }
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def enroll(self, request, slug=None):
        course = self.get_object()
        serializer = EnrollmentSerializer(
            data={'course_id': course.id},
            context={'request': request}
        )
        if serializer.is_valid():
            enrollment = serializer.save()
            return Response(
                {
                    "message": f"Successfully enrolled in course '{course.title}'",
                    "enrollment": EnrollmentSerializer(enrollment).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Get My Courses",
        description="Get list of courses created (for mentors) or enrolled (for students).",
        responses={200: CourseListSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_courses(self, request):
        user = request.user
        if user.role == 'mentor':
            courses = Course.objects.filter(mentor=user)
        else:
            enrolled_ids = Enrollment.objects.filter(student=user).values_list('course_id', flat=True)
            courses = Course.objects.filter(id__in=enrolled_ids)

        serializer = CourseListSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Complete a Lesson",
        description="Mark a lesson as completed for the authenticated enrolled user.",
        request=None,
        responses={
            200: OpenApiResponse(description="Lesson marked as completed."),
            400: OpenApiResponse(description="Lesson not found or user not enrolled."),
            401: OpenApiResponse(description="Unauthorized."),
        }
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete_lesson(self, request, slug=None):
        course = self.get_object()
        lesson_id = request.data.get('lesson_id')
        if not lesson_id:
            return Response({"error": "lesson_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id, module__course=course)
        except Lesson.DoesNotExist:
            return Response({"error": "Lesson not found in this course."}, status=status.HTTP_400_BAD_REQUEST)
            
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        if not enrollment:
            return Response({"error": "User is not enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not enrollment.completed_lessons.filter(id=lesson.id).exists():
            enrollment.completed_lessons.add(lesson)
            
            # Update or create LearningActivity for today
            from django.utils import timezone
            from decimal import Decimal
            today = timezone.now().date()
            activity, created = LearningActivity.objects.get_or_create(
                user=request.user,
                date=today,
                defaults={'course': course, 'hours_spent': Decimal('0.0'), 'lessons_completed_count': 0}
            )
            # Add estimated hours (e.g. lesson.duration in minutes to hours)
            hours = Decimal(lesson.duration) / Decimal(60.0) if lesson.duration else Decimal('0.25')
            activity.hours_spent += hours
            activity.lessons_completed_count += 1
            # If the activity was for a different course today, we just update the most recent course
            activity.course = course
            activity.save()

        # Check if course is fully completed
        total_lessons = Lesson.objects.filter(module__course=course).count()
        if enrollment.completed_lessons.count() >= total_lessons and total_lessons > 0:
            if not enrollment.is_completed:
                enrollment.is_completed = True
                enrollment.save()

        return Response({"message": "Lesson marked as completed.", "lesson_id": lesson.id}, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Email Certificate",
        description="Email the generated PDF certificate to the enrolled user.",
        request=None,
        responses={
            200: OpenApiResponse(description="Certificate emailed successfully."),
            400: OpenApiResponse(description="User not enrolled or invalid PDF."),
        }
    )
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def email_certificate(self, request, slug=None):
        import base64
        from django.core.mail import EmailMessage
        
        course = self.get_object()
        user = request.user
        pdf_base64 = request.data.get('pdf_base64')
        
        if not pdf_base64:
            return Response({"error": "pdf_base64 is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        enrollment = Enrollment.objects.filter(student=user, course=course, is_completed=True).first()
        if not enrollment:
            return Response({"error": "User has not completed this course."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            pdf_data = base64.b64decode(pdf_base64)
            subject = f'Your Certificate of Completion: {course.title}'
            
            html_message = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Congratulations! 🎉</h1>
                </div>
                <div style="padding: 30px; background-color: #ffffff; color: #334155;">
                    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>{user.first_name or user.username}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                        You have successfully completed <strong>"{course.title}"</strong>! We are incredibly proud of your hard work and dedication.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        Please find your official verified certificate attached to this email as a PDF. You can download it, print it, or share it on your LinkedIn profile.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
                    <p style="font-size: 14px; color: #64748b; margin: 0;">
                        Keep learning and building amazing things!<br><br>
                        Best regards,<br>
                        <strong>The SkillPilot Team</strong>
                    </p>
                </div>
            </div>
            """
            
            email = EmailMessage(
                subject,
                html_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
            )
            email.content_subtype = "html" # Main content is now text/html
            email.attach(f'{course.slug}-certificate.pdf', pdf_data, 'application/pdf')
            
            import threading
            def send_email_background(email_obj):
                try:
                    email_obj.send(fail_silently=False)
                except Exception as e:
                    print(f"Background email failed: {e}")
                    
            threading.Thread(target=send_email_background, args=(email,)).start()
            
            return Response({"message": "Certificate emailing in progress."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Failed to process email request: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [IsAuthenticated, IsCourseOwnerOrAdmin]
    filterset_fields = ['course']


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated, IsCourseOwnerOrAdmin]
    filterset_fields = ['module']


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'mentor':
            return Enrollment.objects.filter(course__mentor=user).order_by('-enrolled_at')
        return Enrollment.objects.filter(student=user).order_by('-enrolled_at')


class DashboardStatsView(APIView):
    permission_classes = [AllowAny]  # Allows authenticated & guest user preview

    def get(self, request):
        user = request.user if request.user and request.user.is_authenticated else None
        timeframe = request.query_params.get('timeframe', 'weekly')

        from django.utils import timezone
        import datetime
        from django.db.models import Sum

        now = timezone.now().date()

        if user and getattr(user, 'role', '') == 'mentor':
            courses = Course.objects.filter(mentor=user).order_by('-created_at')
            mentor_enrollments = Enrollment.objects.filter(course__mentor=user).order_by('-enrolled_at')
            payments = Payment.objects.filter(course__mentor=user, status__iexact='completed')
            total_earnings = payments.aggregate(Sum('amount'))['amount__sum'] or 0.0
            
            # 1. Weekly Earnings
            weekly_earnings = []
            days_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            for i in range(6, -1, -1):
                day_date = now - datetime.timedelta(days=i)
                day_name = days_names[day_date.weekday()]
                day_total = float(payments.filter(created_at__date=day_date).aggregate(Sum('amount'))['amount__sum'] or 0.0)
                # scale relative to max $200 per day for visual height
                height_pct = f"{min(int((day_total / 200.0) * 100), 100)}%" if day_total > 0 else "0%"
                weekly_earnings.append({
                    "day": day_name,
                    "amount": day_total,
                    "height": height_pct
                })
                
            # 2. Recent Courses
            recent_courses = []
            for c in courses[:3]:
                recent_courses.append({
                    "id": c.id,
                    "title": c.title,
                    "slug": c.slug,
                    "created_at": c.created_at.isoformat()
                })
                
            # 3. Recent Enrollments
            recent_enrollments = []
            for e in mentor_enrollments[:5]:
                recent_enrollments.append({
                    "student_name": e.student.username,
                    "course_title": e.course.title,
                    "date": e.enrolled_at.isoformat()
                })
                
            # 4. Recent Reviews
            recent_reviews = []
            reviews = CourseReview.objects.filter(course__mentor=user).order_by('-created_at')[:4]
            for r in reviews:
                recent_reviews.append({
                    "student_name": r.student.username,
                    "course_title": r.course.title,
                    "rating": r.rating,
                    "comment": r.comment,
                    "date": r.created_at.isoformat()
                })

            return Response({
                "role": "mentor",
                "total_published_courses": courses.count(),
                "total_students_enrolled": mentor_enrollments.count(),
                "total_earnings": float(total_earnings),
                "weekly_earnings": weekly_earnings,
                "recent_courses": recent_courses,
                "recent_enrollments": recent_enrollments,
                "recent_reviews": recent_reviews,
            }, status=status.HTTP_200_OK)

        if user:
            enrollments = Enrollment.objects.filter(student=user)
            enrolled_courses = Course.objects.filter(id__in=enrollments.values_list('course_id', flat=True))
            enrolled_count = enrolled_courses.count()
            
            first_of_month = now.replace(day=1)
            active_this_month = enrollments.filter(enrolled_at__date__gte=first_of_month).count()
            user_activities = LearningActivity.objects.filter(user=user)
            certificates_count = enrollments.filter(is_completed=True).count()
        else:
            enrolled_courses = Course.objects.none()
            enrolled_count = 0
            active_this_month = 0
            user_activities = LearningActivity.objects.none()
            certificates_count = 0

        # 1. Real Learning Hours & Completed Lessons from Database
        tot_hours = float(user_activities.aggregate(Sum('hours_spent'))['hours_spent__sum'] or 0.0)
        learning_hours = round(tot_hours, 1)
        tot_lessons = int(user_activities.aggregate(Sum('lessons_completed_count'))['lessons_completed_count__sum'] or 0)
        lessons_completed = tot_lessons

        # 2. Dynamic Weekly Activity (Real Database records for last 7 days)
        weekly_activity = []
        days_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(6, -1, -1):
            day_date = now - datetime.timedelta(days=i)
            day_name = days_names[day_date.weekday()]
            total_h = float(user_activities.filter(date=day_date).aggregate(Sum('hours_spent'))['hours_spent__sum'] or 0.0)
            height_pct = f"{min(int((total_h / 8.0) * 100), 100)}%" if total_h > 0 else "0%"
            weekly_activity.append({
                "day": day_name,
                "date": str(day_date),
                "hours": round(total_h, 1),
                "height": height_pct
            })

        # 3. Dynamic Monthly Activity (Real Database records for last 4 weeks)
        monthly_activity = []
        for w in range(4, 0, -1):
            w_start = now - datetime.timedelta(days=w * 7)
            w_end = now - datetime.timedelta(days=(w - 1) * 7)
            total_h = float(user_activities.filter(date__gte=w_start, date__lt=w_end).aggregate(Sum('hours_spent'))['hours_spent__sum'] or 0.0)
            height_pct = f"{min(int((total_h / 30.0) * 100), 100)}%" if total_h > 0 else "0%"
            monthly_activity.append({
                "day": f"Week {5 - w}",
                "date": f"{w_start.strftime('%b %d')} - {w_end.strftime('%b %d')}",
                "hours": round(total_h, 1),
                "height": height_pct
            })

        # 4. Status badges
        study_velocity = "Top 10% study velocity" if learning_hours > 0 else "0 hrs logged"
        average_score = "85% average score" if lessons_completed > 0 else "No quiz data"

        # 5. Last active enrolled course
        last_activity = user_activities.exclude(course__isnull=True).order_by('-date', '-created_at').first()
        if last_activity and enrollments.filter(course=last_activity.course).exists():
            last_enrollment = enrollments.filter(course=last_activity.course).first()
        else:
            last_enrollment = enrollments.first() if enrollments.exists() else None
            
        last_active_course = None
        if last_enrollment:
            last_course = last_enrollment.course
            cat_name = last_course.category.name if last_course.category else (getattr(last_course, 'category_name', '') or '')
            
            # Calculate completion percentage
            completed_count = last_enrollment.completed_lessons.count()
            total_lessons = Lesson.objects.filter(module__course=last_course).count()
            completion_pct = int((completed_count / total_lessons) * 100) if total_lessons > 0 else 0
            
            # Find current module based on last completed lesson
            current_module_title = "Module 1: Introduction"
            if completed_count > 0:
                last_completed = last_enrollment.completed_lessons.order_by('-module__order', '-order').first()
                if last_completed:
                    current_module_title = last_completed.module.title
            else:
                first_module = last_course.modules.first()
                if first_module:
                    current_module_title = first_module.title

            last_active_course = {
                "id": last_course.id,
                "title": last_course.title,
                "slug": last_course.slug,
                "category_name": cat_name,
                "thumbnail": str(last_course.thumbnail) if last_course.thumbnail else None,
                "current_module_title": current_module_title,
                "completion_percentage": completion_pct,
            }

        return Response({
            "enrolled_courses_count": enrolled_count,
            "active_this_month": active_this_month,
            "learning_hours": learning_hours,
            "study_velocity": study_velocity,
            "lessons_completed": lessons_completed,
            "average_score": average_score,
            "certificates_count": certificates_count,
            "weekly_activity": weekly_activity,
            "monthly_activity": monthly_activity,
            "timeframe": timeframe,
            "last_active_course": last_active_course,
        }, status=status.HTTP_200_OK)


class CourseReviewViewSet(viewsets.ModelViewSet):
    queryset = CourseReview.objects.all()
    serializer_class = CourseReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_fields = ['course', 'course__slug']
    
    def get_queryset(self):
        slug = self.request.query_params.get('course_slug')
        if slug:
            return CourseReview.objects.filter(course__slug=slug)
        return super().get_queryset()

    def create(self, request, *args, **kwargs):
        # Allow student to review only if they are enrolled and have completed the course
        course_id = request.data.get('course')
        if not course_id:
            return Response({"error": "course field is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        enrollment = Enrollment.objects.filter(student=request.user, course_id=course_id, is_completed=True).exists()
        if not enrollment:
            return Response({"error": "You must complete the course before leaving a review."}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if already reviewed
        existing_review = CourseReview.objects.filter(student=request.user, course_id=course_id).first()
        if existing_review:
            serializer = self.get_serializer(existing_review, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
