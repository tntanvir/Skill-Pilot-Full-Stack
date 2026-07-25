import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'root.settings')
django.setup()

from django.core.mail import send_mail

try:
    send_mail(
        'Test Subject',
        'Test Message.',
        'rohimaakt257@gmail.com',
        ['rohimaakt257@gmail.com'],
        fail_silently=False,
    )
    print("Email sent successfully!")
except Exception as e:
    print(f"Error: {e}")
