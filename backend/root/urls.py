from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Accounts & Auth APIs
    path('api/auth/', include('accounts.urls')),
    path('api/', include('accounts.urls')),  # Direct access: /api/register/, /api/login/, etc.

    # Course APIs
    path('api/', include('course.urls')),

    # Payment APIs
    path('api/payments/', include('payment.urls')),

    # Chat & AI Advisor APIs
    path('api/chat/', include('chat.urls')),

    # API Documentation (Swagger UI)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Explicit media and thumbnail static routes
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^course_thumbnails/(?P<path>.*)$', serve, {'document_root': settings.BASE_DIR / 'course_thumbnails'}),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
