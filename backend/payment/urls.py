from django.urls import path
from .views import (
    CreateCheckoutSessionView,
    StripeWebhookView,
    CustomerPaymentHistoryView,
    MentorEarningsHistoryView,
)

app_name = 'payment'

urlpatterns = [
    path('create-checkout-session/<int:course_id>/', CreateCheckoutSessionView.as_view(), name='create-checkout-session-by-id'),
    path('create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('history/customer/', CustomerPaymentHistoryView.as_view(), name='customer-payment-history'),
    path('history/mentor/', MentorEarningsHistoryView.as_view(), name='mentor-earnings-history'),
]
