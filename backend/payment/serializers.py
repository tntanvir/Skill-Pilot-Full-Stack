from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Payment


class PaymentHistorySerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True, default='')

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'user_email',
            'user_full_name',
            'course',
            'course_title',
            'stripe_checkout_session_id',
            'stripe_payment_intent_id',
            'amount',
            'currency',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class PaymentSerializer(PaymentHistorySerializer):
    """Alias for backwards compatibility and generic payment serialization."""
    pass
