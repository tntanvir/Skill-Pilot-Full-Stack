from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'currency')
    search_fields = ('user__email', 'course__title', 'stripe_checkout_session_id', 'stripe_payment_intent_id')
    readonly_fields = ('created_at', 'updated_at')
