"""
API URL routes for core app (Department, Employee, Project).
Uses custom router so /api/ shows functional HTTP method buttons.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    APIRootWithButtonsView,
    DepartmentViewSet,
    EmployeeViewSet,
    ProjectViewSet,
)


class RouterWithButtons(DefaultRouter):
    """Router that uses API root view with HTTP method buttons."""
    APIRootView = APIRootWithButtonsView


router = RouterWithButtons()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
]
