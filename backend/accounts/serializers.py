from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import OTP
from .utils import send_otp_email

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'phone_number', 'address', 'role', 'role_display', 'bio',
            'profile_picture', 'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'phone_number', 'address', 'role', 'bio'
        ]
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone_number': {'required': False},
            'address': {'required': False},
            'role': {'required': False},
            'bio': {'required': False},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        username = validated_data.get('username')

        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone_number=validated_data.get('phone_number', None),
            address=validated_data.get('address', None),
            role=validated_data.get('role', 'student'),
            bio=validated_data.get('bio', None),
            is_verified=False,
            is_active=False,
        )

        # Generate and send OTP
        otp_instance = OTP.generate_otp(user=user, purpose='registration')
        send_otp_email(user.email, otp_instance.code, purpose='registration')

        return user


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)
    purpose = serializers.ChoiceField(choices=OTP.PURPOSE_CHOICES, default='registration')

    def validate(self, attrs):
        email = attrs.get('email').lower()
        code = attrs.get('otp')
        purpose = attrs.get('purpose')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No user found with this email address."})

        # Fetch the latest active OTP for this user & purpose
        otp_obj = OTP.objects.filter(user=user, purpose=purpose, is_used=False).first()

        if not otp_obj:
            raise serializers.ValidationError({"otp": "No active OTP found. Please request a new code."})

        if otp_obj.code != code:
            raise serializers.ValidationError({"otp": "Invalid OTP code."})

        if not otp_obj.is_valid():
            raise serializers.ValidationError({"otp": "OTP code has expired. Please request a new one."})

        attrs['user'] = user
        attrs['otp_obj'] = otp_obj
        return attrs


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(choices=OTP.PURPOSE_CHOICES, default='registration')

    def validate(self, attrs):
        email = attrs.get('email').lower()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No account found with this email address."})

        attrs['user'] = user
        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email').lower()
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"non_field_errors": "Invalid email or password."})

        if not user.check_password(password):
            raise serializers.ValidationError({"non_field_errors": "Invalid email or password."})

        if not user.is_verified:
            raise serializers.ValidationError({
                "non_field_errors": "Email address is not verified. Please verify your email via OTP."
            })

        if not user.is_active:
            raise serializers.ValidationError({"non_field_errors": "This user account is inactive."})

        refresh = RefreshToken.for_user(user)

        attrs['user'] = user
        attrs['tokens'] = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        email = value.lower()
        if not User.objects.filter(email=email).exists():
            raise serializers.ValidationError("No account found with this email address.")
        return email


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        email = attrs.get('email').lower()
        code = attrs.get('otp')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "No user found with this email address."})

        otp_obj = OTP.objects.filter(user=user, purpose='forgot_password', is_used=False).first()

        if not otp_obj:
            raise serializers.ValidationError({"otp": "No active password reset OTP found. Please request a new one."})

        if otp_obj.code != code:
            raise serializers.ValidationError({"otp": "Invalid OTP code."})

        if not otp_obj.is_valid():
            raise serializers.ValidationError({"otp": "OTP code has expired. Please request a new one."})

        attrs['user'] = user
        attrs['otp_obj'] = otp_obj
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({"new_password": "New password cannot be the same as old password."})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

