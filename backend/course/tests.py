from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from course.models import Category, Course, Module, Lesson, Enrollment, Payment

User = get_user_model()


class CourseAppTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Mentor user
        self.mentor = User.objects.create_user(
            email="mentor@example.com",
            username="mentoruser",
            password="MentorPassword123!",
            role="mentor",
            is_verified=True,
            is_active=True
        )

        # Create Student user
        self.student = User.objects.create_user(
            email="student@example.com",
            username="studentuser",
            password="StudentPassword123!",
            role="student",
            is_verified=True,
            is_active=True
        )

        # Create Category
        self.category = Category.objects.create(name="Web Development", description="Web dev courses")

    def test_mentor_create_course(self):
        # Authenticate as mentor
        self.client.force_authenticate(user=self.mentor)

        response = self.client.post(
            reverse('course-list'),
            {
                "title": "Full Stack Python & React",
                "description": "Learn Full Stack web development from scratch.",
                "category": self.category.id,
                "price": "49.99",
                "level": "beginner",
                "is_published": True
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 1)
        course = Course.objects.first()
        self.assertEqual(course.mentor, self.mentor)

    def test_student_enroll_in_course(self):
        course = Course.objects.create(
            title="Django REST Masterclass",
            description="Master DRF and APIs.",
            mentor=self.mentor,
            category=self.category,
            price="29.99",
            level="intermediate",
            is_published=True
        )

        # Authenticate as student
        self.client.force_authenticate(user=self.student)

        enroll_url = reverse('course-enroll', kwargs={'slug': course.slug})
        response = self.client.post(enroll_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify enrollment
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=course).exists())

    def test_video_url_visibility_protection(self):
        course = Course.objects.create(
            title="Protected Course",
            description="Protected video course.",
            mentor=self.mentor,
            category=self.category,
            is_published=True
        )
        module = Module.objects.create(course=course, title="Module 1")
        preview_lesson = Lesson.objects.create(
            module=module,
            title="Preview Lesson",
            video_url="https://example.com/preview.mp4",
            is_preview=True
        )
        locked_lesson = Lesson.objects.create(
            module=module,
            title="Locked Lesson",
            video_url="https://example.com/secret.mp4",
            is_preview=False
        )

        detail_url = reverse('course-detail', kwargs={'slug': course.slug})

        # 1. Unauthenticated User GET detail (Preview video is visible, locked video is None)
        self.client.logout()
        resp_unauth = self.client.get(detail_url)
        self.assertEqual(resp_unauth.status_code, status.HTTP_200_OK)
        lessons_unauth = resp_unauth.data["modules"][0]["lessons"]
        self.assertEqual(lessons_unauth[0]["video_url"], "https://example.com/preview.mp4")
        self.assertIsNone(lessons_unauth[1]["video_url"])

        # 2. Non-enrolled Student GET detail (Preview video is visible, locked video is None)
        self.client.force_authenticate(user=self.student)
        resp_student_not_enrolled = self.client.get(detail_url)
        lessons_student_not_enrolled = resp_student_not_enrolled.data["modules"][0]["lessons"]
        self.assertEqual(lessons_student_not_enrolled[0]["video_url"], "https://example.com/preview.mp4")
        self.assertIsNone(lessons_student_not_enrolled[1]["video_url"])

        # 3. Enroll Student and GET detail (All video_urls become visible)
        Enrollment.objects.create(student=self.student, course=course)
        resp_enrolled = self.client.get(detail_url)
        lessons_enrolled = resp_enrolled.data["modules"][0]["lessons"]
        self.assertEqual(lessons_enrolled[0]["video_url"], "https://example.com/preview.mp4")
        self.assertEqual(lessons_enrolled[1]["video_url"], "https://example.com/secret.mp4")

    def test_google_drive_and_video_qualities(self):
        course = Course.objects.create(
            title="Google Drive Video Course",
            description="Course using Google Drive link.",
            mentor=self.mentor,
            category=self.category,
            is_published=True
        )
        module = Module.objects.create(course=course, title="Module Drive")
        gdrive_url = "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I/view?usp=sharing"
        lesson = Lesson.objects.create(
            module=module,
            title="Google Drive Lesson",
            video_url=gdrive_url,
            is_preview=True
        )

        detail_url = reverse('course-detail', kwargs={'slug': course.slug})
        resp = self.client.get(detail_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        lesson_data = resp.data["modules"][0]["lessons"][0]
        self.assertEqual(lesson_data["video_url"], "https://drive.google.com/uc?export=download&id=1A2B3C4D5E6F7G8H9I")
        self.assertIn("video_qualities", lesson_data)
        self.assertEqual(lesson_data["video_qualities"]["auto"], "https://drive.google.com/uc?export=download&id=1A2B3C4D5E6F7G8H9I")
        self.assertIn("1080p", lesson_data["video_qualities"])
        self.assertIn("720p", lesson_data["video_qualities"])
        self.assertIn("480p", lesson_data["video_qualities"])
        self.assertIn("360p", lesson_data["video_qualities"])

    def test_stripe_webhook_and_free_checkout(self):
        # 1. Test Free Course Checkout
        free_course = Course.objects.create(
            title="Free Python Course",
            description="Free intro course.",
            mentor=self.mentor,
            category=self.category,
            price="0.00",
            is_published=True
        )

        self.client.force_authenticate(user=self.student)
        free_checkout_resp = self.client.post(
            reverse('create-checkout-session'),
            {"course_id": free_course.id},
            format='json'
        )
        self.assertEqual(free_checkout_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(free_checkout_resp.data["is_free"])
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=free_course).exists())

        # 2. Test Stripe Webhook Payment Event
        paid_course = Course.objects.create(
            title="Paid Masterclass",
            description="Paid course.",
            mentor=self.mentor,
            category=self.category,
            price="99.99",
            is_published=True
        )

        webhook_url = reverse('stripe-webhook')
        webhook_payload = {
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_session_12345",
                    "payment_intent": "pi_test_intent_12345",
                    "metadata": {
                        "course_id": str(paid_course.id),
                        "user_id": str(self.student.id)
                    }
                }
            }
        }

        webhook_resp = self.client.post(
            webhook_url,
            data=webhook_payload,
            format='json'
        )
        self.assertEqual(webhook_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(Enrollment.objects.filter(student=self.student, course=paid_course).exists())
