"""
DRF ViewSets: Create, Read, Update, Delete for Department, Employee, Project.
Plus a simple CRUD UI (template view).
"""
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.views.generic import TemplateView
from rest_framework import viewsets
from rest_framework.routers import APIRootView
from .models import Department, Employee, Project
from .serializers import DepartmentSerializer, EmployeeSerializer, ProjectSerializer


class CRUDUIView(TemplateView):
    """Serve the CRUD UI page."""
    template_name = 'core/crud_ui.html'


class APIRootWithButtonsView(APIRootView):
    """API root."""

    def get_view_name(self):
        return 'Api'

    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        if getattr(request, 'accepted_renderer', None) and getattr(request.accepted_renderer, 'format', None) == 'html':
            html = render_to_string(
                'rest_framework/api_root_buttons.html',
                {'urls': response.data, 'request': request, 'view': self}
            )
            return HttpResponse(html)
        return response


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    CRUD via HTTP methods:
    - GET    /api/departments/       → list (Read)
    - POST   /api/departments/       → create (Create)
    - GET    /api/departments/<id>/  → retrieve (Read one)
    - PUT    /api/departments/<id>/  → update (Update)
    - PATCH  /api/departments/<id>/  → partial_update (Update partial)
    - DELETE /api/departments/<id>/  → destroy (Delete)
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    CRUD via HTTP methods:
    - GET    /api/employees/       → list (Read)
    - POST   /api/employees/       → create (Create)
    - GET    /api/employees/<id>/  → retrieve (Read one)
    - PUT    /api/employees/<id>/  → update (Update)
    - PATCH  /api/employees/<id>/  → partial_update (Update partial)
    - DELETE /api/employees/<id>/  → destroy (Delete)
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """
    CRUD via HTTP methods:
    - GET    /api/projects/       → list (Read)
    - POST   /api/projects/       → create (Create)
    - GET    /api/projects/<id>/  → retrieve (Read one)
    - PUT    /api/projects/<id>/  → update (Update)
    - PATCH  /api/projects/<id>/  → partial_update (Update partial)
    - DELETE /api/projects/<id>/  → destroy (Delete)
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
