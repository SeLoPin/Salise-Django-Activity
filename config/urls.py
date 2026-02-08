"""
URL configuration for DRF Act 1 SALISE project.
"""
from django.contrib import admin
from django.urls import path, include

from core.views import CRUDUIView

urlpatterns = [
    path('', CRUDUIView.as_view(), name='crud_ui'),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]
