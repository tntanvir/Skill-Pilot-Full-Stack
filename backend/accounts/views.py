from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .serializers import (
    RegisterSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    LoginSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    UserSerializer,
)
from .models import OTP
from .utils import send_otp_email


class RegisterView(APIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(
        summary="User Registration",
        description="Register a new user and automatically send an email verification OTP code.",
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description="User registered successfully. OTP sent via email."),
            400: OpenApiResponse(description="Validation Error."),
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User registered successfully. An OTP has been sent to your email for verification.",
                    "user": UserSerializer(user).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyOTPSerializer

    @extend_schema(
        summary="Verify Email / Password Reset OTP",
        description="Verify 6-digit OTP code sent to user's email for registration or forgot-password purpose.",
        request=VerifyOTPSerializer,
        responses={
            200: OpenApiResponse(description="OTP verified successfully."),
            400: OpenApiResponse(description="Invalid or expired OTP."),
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            otp_obj = serializer.validated_data['otp_obj']
            purpose = serializer.validated_data['purpose']

            # Mark OTP as used
            otp_obj.is_used = True
            otp_obj.save()

            if purpose == 'registration':
                user.is_verified = True
                user.is_active = True
                user.save()
                return Response(
                    {"message": "Email verified successfully. Account is now active. You can log in."},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"message": "OTP verified successfully. You can now reset your password."},
                    status=status.HTTP_200_OK
                )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ResendOTPSerializer

    @extend_schema(
        summary="Resend OTP Code",
        description="Resend a new 6-digit OTP code to the registered user's email address.",
        request=ResendOTPSerializer,
        responses={
            200: OpenApiResponse(description="New OTP code sent via email."),
            400: OpenApiResponse(description="User not found or validation error."),
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            purpose = serializer.validated_data['purpose']

            if purpose == 'registration' and user.is_verified:
                return Response(
                    {"message": "This account is already verified."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            otp_instance = OTP.generate_otp(user=user, purpose=purpose)
            send_otp_email(user.email, otp_instance.code, purpose=purpose)

            return Response(
                {"message": "A new OTP has been sent to your email address."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        summary="User Login",
        description="Authenticate user with email and password. Requires verified email address.",
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description="Login successful. Returns JWT access & refresh tokens."),
            400: OpenApiResponse(description="Invalid credentials or email unverified."),
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = serializer.validated_data['tokens']
            return Response(
                {
                    "message": "Login successful.",
                    "user": UserSerializer(user).data,
                    "tokens": tokens
                },
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ForgotPasswordSerializer

    @extend_schema(
        summary="Request Password Reset OTP",
        description="Send a 6-digit OTP code to user's email for password reset.",
        request=ForgotPasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password reset OTP sent to email."),
            400: OpenApiResponse(description="Email not found or validation error."),
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(email=email)

            otp_instance = OTP.generate_otp(user=user, purpose='forgot_password')
            send_otp_email(user.email, otp_instance.code, purpose='forgot_password')

            return Response(
                {"message": "Password reset OTP has been sent to your email address."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer

    @extend_schema(
        summary="Reset Password with OTP",
        description="Set a new password using verified OTP code.",
        request=ResetPasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password reset successfully."),
            400: OpenApiResponse(description="Invalid OTP or password validation error."),
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            otp_obj = serializer.validated_data['otp_obj']
            new_password = serializer.validated_data['new_password']

            # Update password
            user.set_password(new_password)
            user.save()

            # Mark OTP as used
            otp_obj.is_used = True
            otp_obj.save()

            return Response(
                {"message": "Password has been reset successfully. You can now log in with your new password."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @extend_schema(
        summary="Get Current Authenticated User Profile",
        description="Retrieve profile details of the currently logged-in user using Bearer Token authorization.",
        responses={
            200: UserSerializer,
            401: OpenApiResponse(description="Unauthorized. Missing or invalid Bearer Token."),
        }
    )
    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update Authenticated User Profile",
        description="Update profile details of the currently logged-in user, including profile picture upload.",
        request=UserSerializer,
        responses={
            200: UserSerializer,
            400: OpenApiResponse(description="Validation error."),
            401: OpenApiResponse(description="Unauthorized. Missing or invalid Bearer Token."),
        }
    )
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @extend_schema(
        summary="Change Authenticated User Password",
        description="Change password for the currently logged-in user.",
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password changed successfully."),
            400: OpenApiResponse(description="Validation error or incorrect old password."),
            401: OpenApiResponse(description="Unauthorized. Missing or invalid Bearer Token."),
        }
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password changed successfully."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

