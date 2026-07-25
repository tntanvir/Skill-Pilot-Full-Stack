from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import OTP

User = get_user_model()


class UserManagerTestCase(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            email="normal@user.com",
            username="normaluser",
            password="userpassword123",
            role="student"
        )
        self.assertEqual(user.email, "normal@user.com")
        self.assertEqual(user.username, "normaluser")
        self.assertTrue(user.check_password("userpassword123"))
        self.assertEqual(user.role, "student")
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@user.com",
            username="adminuser",
            password="adminpassword123"
        )
        self.assertEqual(admin.email, "admin@user.com")
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_verified)
        self.assertTrue(admin.is_active)
        self.assertEqual(admin.role, "admin")


class AuthAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.verify_otp_url = reverse('verify-otp')
        self.resend_otp_url = reverse('resend-otp')
        self.login_url = reverse('login')
        self.forgot_password_url = reverse('forgot-password')
        self.reset_password_url = reverse('reset-password')

        self.user_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "+1234567890",
            "address": "123 Main Street, City",
            "role": "mentor",
            "bio": "Passionate mentor in Software Engineering."
        }

    def test_full_auth_flow(self):
        # 1. Register User with custom profile fields
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", reg_resp.data)
        self.assertEqual(reg_resp.data["user"]["role"], "mentor")
        self.assertEqual(reg_resp.data["user"]["phone_number"], "+1234567890")

        user = User.objects.get(email="testuser@example.com")
        self.assertFalse(user.is_verified)
        self.assertFalse(user.is_active)
        self.assertEqual(user.role, "mentor")
        self.assertEqual(user.phone_number, "+1234567890")

        # Retrieve generated OTP
        otp_obj = OTP.objects.filter(user=user, purpose='registration').first()
        self.assertIsNotNone(otp_obj)

        # 2. Attempt login before OTP verification (should fail)
        login_fail = self.client.post(self.login_url, {
            "email": "testuser@example.com",
            "password": "SecurePassword123!"
        }, format='json')
        self.assertEqual(login_fail.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Verify OTP
        verify_resp = self.client.post(self.verify_otp_url, {
            "email": "testuser@example.com",
            "otp": otp_obj.code,
            "purpose": "registration"
        }, format='json')
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_verified)
        self.assertTrue(user.is_active)

        # 4. Successful Login after OTP verification
        login_success = self.client.post(self.login_url, {
            "email": "testuser@example.com",
            "password": "SecurePassword123!"
        }, format='json')
        self.assertEqual(login_success.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", login_success.data)
        self.assertIn("access", login_success.data["tokens"])

        # 5. Forgot Password Request
        forgot_resp = self.client.post(self.forgot_password_url, {
            "email": "testuser@example.com"
        }, format='json')
        self.assertEqual(forgot_resp.status_code, status.HTTP_200_OK)

        reset_otp_obj = OTP.objects.filter(user=user, purpose='forgot_password').first()
        self.assertIsNotNone(reset_otp_obj)

        # 6. Reset Password with OTP
        reset_resp = self.client.post(self.reset_password_url, {
            "email": "testuser@example.com",
            "otp": reset_otp_obj.code,
            "new_password": "NewSecurePassword123!",
            "confirm_password": "NewSecurePassword123!"
        }, format='json')
        self.assertEqual(reset_resp.status_code, status.HTTP_200_OK)

        # 7. Login with New Password
        login_new_pass = self.client.post(self.login_url, {
            "email": "testuser@example.com",
            "password": "NewSecurePassword123!"
        }, format='json')
        self.assertEqual(login_new_pass.status_code, status.HTTP_200_OK)

    def test_resend_otp(self):
        # Register user
        self.client.post(self.register_url, self.user_data, format='json')
        user = User.objects.get(email="testuser@example.com")

        # Resend OTP
        resend_resp = self.client.post(self.resend_otp_url, {
            "email": "testuser@example.com",
            "purpose": "registration"
        }, format='json')
        self.assertEqual(resend_resp.status_code, status.HTTP_200_OK)

        # Check that a new OTP was generated
        active_otps = OTP.objects.filter(user=user, purpose='registration', is_used=False)
        self.assertEqual(active_otps.count(), 1)

    def test_authenticated_user_profile_and_change_password(self):
        # Register and verify user
        self.client.post(self.register_url, self.user_data, format='json')
        user = User.objects.get(email="testuser@example.com")
        otp_obj = OTP.objects.filter(user=user, purpose='registration').first()
        self.client.post(self.verify_otp_url, {
            "email": "testuser@example.com",
            "otp": otp_obj.code,
            "purpose": "registration"
        }, format='json')

        # Login to obtain access token
        login_resp = self.client.post(self.login_url, {
            "email": "testuser@example.com",
            "password": "SecurePassword123!"
        }, format='json')
        access_token = login_resp.data["tokens"]["access"]

        # 1. Get User Profile with Bearer token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        profile_resp = self.client.get(reverse('user-profile'))
        self.assertEqual(profile_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_resp.data["email"], "testuser@example.com")
        self.assertEqual(profile_resp.data["role"], "mentor")

        # 2. Change Password with Bearer token
        change_pass_resp = self.client.post(reverse('change-password'), {
            "old_password": "SecurePassword123!",
            "new_password": "BrandNewPassword123!",
            "confirm_password": "BrandNewPassword123!"
        }, format='json')
        self.assertEqual(change_pass_resp.status_code, status.HTTP_200_OK)

        # 3. Login with newly changed password
        self.client.credentials()  # Clear auth headers
        login_changed_pass = self.client.post(self.login_url, {
            "email": "testuser@example.com",
            "password": "BrandNewPassword123!"
        }, format='json')
        self.assertEqual(login_changed_pass.status_code, status.HTTP_200_OK)
