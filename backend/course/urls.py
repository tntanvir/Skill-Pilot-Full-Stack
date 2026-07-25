from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    CourseViewSet,
    ModuleViewSet,
    LessonViewSet,
    EnrollmentViewSet,
    DashboardStatsView,
    CourseReviewViewSet,
)
from payment.views import (
    CreateCheckoutSessionView as CreateStripeCheckoutView,
    StripeWebhookView,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'modules', ModuleViewSet, basename='module')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'reviews', CourseReviewViewSet, basename='review')

urlpatterns = [
    # Dashboard Analytics Endpoint
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Stripe Payment Endpoints
    path('payments/create-checkout-session/', CreateStripeCheckoutView.as_view(), name='create-checkout-session'),
    path('payments/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),

    path('', include(router.urls)),
]
