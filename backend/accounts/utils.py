import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)


def send_otp_email(user_email, otp_code, purpose='registration'):
    """
    Sends an OTP verification email to the user.
    """
    if purpose == 'registration':
        subject = 'SkillPilot - Verify Your Email Address'
        title = 'Email Verification'
        message_intro = 'Thank you for registering with SkillPilot. Please use the OTP below to verify your email address:'
    else:
        subject = 'SkillPilot - Password Reset OTP'
        title = 'Password Reset Request'
        message_intro = 'You requested a password reset for your SkillPilot account. Use the OTP below to reset your password:'

    expiry_minutes = getattr(settings, 'OTP_EXPIRY_MINUTES', 10)

    text_content = (
        f"Hello,\n\n"
        f"{message_intro}\n\n"
        f"Your OTP Code: {otp_code}\n\n"
        f"This code will expire in {expiry_minutes} minutes.\n"
        f"If you did not request this code, please ignore this email.\n\n"
        f"Best regards,\nSkillPilot Team"
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }}
            .header {{ text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 20px; }}
            .header h1 {{ color: #4F46E5; margin: 0; font-size: 24px; }}
            .content {{ color: #374151; font-size: 16px; line-height: 1.6; text-align: center; }}
            .otp-box {{ display: inline-block; background: #EEF2FF; border: 2px dashed #6366F1; color: #4338CA; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px 30px; margin: 20px 0; border-radius: 8px; }}
            .footer {{ text-align: center; margin-top: 30px; font-size: 13px; color: #9CA3AF; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SkillPilot</h1>
                <p style="color: #6B7280; font-size: 14px; margin-top: 5px;">{title}</p>
            </div>
            <div class="content">
                <p>{message_intro}</p>
                <div class="otp-box">{otp_code}</div>
                <p style="font-size: 14px; color: #6B7280;">This code is valid for <strong>{expiry_minutes} minutes</strong>.</p>
            </div>
            <div class="footer">
                <p>If you did not request this email, you can safely ignore it.</p>
                <p>&copy; SkillPilot. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', settings.EMAIL_HOST_USER)

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, [user_email])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {user_email}: {str(e)}")
        # In development/debug mode, print OTP to console if email fails
        if settings.DEBUG:
            print(f"\n[DEBUG OTP EMAIL] To: {user_email} | Purpose: {purpose} | OTP Code: {otp_code}\n")
        return False
