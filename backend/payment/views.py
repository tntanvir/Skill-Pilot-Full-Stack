import os
import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema, OpenApiResponse

from course.models import Course, Enrollment
from .models import Payment
from .serializers import PaymentHistorySerializer

User = get_user_model()
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', os.getenv('STRIPE_SECRET_KEY', ''))


class PaymentFilter(filters.FilterSet):
    status = filters.ChoiceFilter(choices=Payment.STATUS_CHOICES)
    min_amount = filters.NumberFilter(field_name="amount", lookup_expr='gte')
    max_amount = filters.NumberFilter(field_name="amount", lookup_expr='lte')

    class Meta:
        model = Payment
        fields = ['status', 'min_amount', 'max_amount']


class CreateCheckoutSessionView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Create Stripe Checkout Session",
        description="Creates a Stripe Checkout Session for purchasing a course and returns the checkout URL.",
        responses={200: OpenApiResponse(description="Checkout session created successfully.")}
    )
    def post(self, request, course_id=None):
        target_course_id = course_id or request.data.get('course_id')
        if not target_course_id:
            return Response({"error": "course_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(id=target_course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        # Prevent duplicate enrollment purchase if already enrolled
        if Enrollment.objects.filter(student=user, course=course).exists():
            return Response({"error": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

        # Handle free courses
        if course.price <= 0:
            Enrollment.objects.get_or_create(student=user, course=course)
            return Response({
                "is_free": True,
                "message": "Enrolled in free course successfully."
            }, status=status.HTTP_200_OK)

        amount_cents = int(float(course.price) * 100)
        domain_url = getattr(settings, 'FRONTEND_URL', os.getenv('FRONTEND_URL', 'http://localhost:3000')).rstrip('/')

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'unit_amount': amount_cents,
                            'product_data': {
                                'name': course.title,
                                'description': course.description[:255] if course.description else '',
                            },
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=f"{domain_url}/dashboard/payments?session_id={{CHECKOUT_SESSION_ID}}&success=true",
                cancel_url=f"{domain_url}/courses/{course.id}?canceled=true",
                client_reference_id=str(course.id),
                metadata={
                    'course_id': str(course.id),
                    'user_id': str(user.id),
                }
            )

            # Store the payment intent/session locally
            Payment.objects.update_or_create(
                user=user,
                course=course,
                defaults={
                    'stripe_checkout_session_id': checkout_session['id'],
                    'amount': course.price,
                    'currency': 'usd',
                    'status': 'pending'
                }
            )

            return Response({
                'checkout_url': checkout_session.url,
                'session_id': checkout_session['id']
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Stripe Webhook Listener",
        description="Receives Stripe webhook notifications to verify signatures and complete payments.",
        responses={200: OpenApiResponse(description="Webhook received successfully.")}
    )
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', os.getenv('STRIPE_WEBHOOK_SECRET', ''))

        event = None

        if webhook_secret and sig_header:
            try:
                stripe.Webhook.construct_event(
                    payload, sig_header, webhook_secret
                )
            except ValueError:
                return Response({"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)
            except stripe.error.SignatureVerificationError:
                return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        import json
        try:
            event = json.loads(payload.decode('utf-8'))
        except Exception:
            return Response({"error": "Invalid payload format"}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event.get('type')
        event_data = event.get('data')

        if event_type == 'checkout.session.completed':
            session = event_data['object']
            metadata = session.get('metadata', {})
            course_id = metadata.get('course_id') or session.get('client_reference_id')
            user_id = metadata.get('user_id')
            session_id = session.get('id')
            payment_intent = session.get('payment_intent')

            if course_id and user_id:
                try:
                    user_obj = User.objects.get(id=user_id)
                    course_obj = Course.objects.get(id=course_id)

                    # Mark enrollment as active/created
                    Enrollment.objects.get_or_create(student=user_obj, course=course_obj)

                    # Mark payment completed
                    Payment.objects.filter(stripe_checkout_session_id=session_id).update(
                        status='completed',
                        stripe_payment_intent_id=payment_intent
                    )
                except Exception as e:
                    return Response({"error": f"Database error during fulfillment: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": "success"}, status=status.HTTP_200_OK)


class CustomerPaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentHistorySerializer
    permission_classes = [IsAuthenticated]
    filterset_class = PaymentFilter

    @extend_schema(
        summary="Customer Payment History",
        description="Returns payment history for the authenticated student with status and amount filters."
    )
    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')


class MentorEarningsHistoryView(generics.ListAPIView):
    serializer_class = PaymentHistorySerializer
    permission_classes = [IsAuthenticated]
    filterset_class = PaymentFilter

    @extend_schema(
        summary="Mentor Earnings History",
        description="Returns earnings/payment history for courses owned by the authenticated mentor with status and amount filters."
    )
    def get_queryset(self):
        return Payment.objects.filter(course__mentor=self.request.user).order_by('-created_at')
