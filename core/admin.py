from django.contrib import admin
from .models import Department, Employee, Project


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('dept_id', 'bldg_id', 'dept_name')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('emp_id', 'emp_name', 'emp_age', 'emp_sex', 'dept')
    list_filter = ('dept',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('proj_id', 'proj_name', 'emp', 'dept')
    list_filter = ('dept',)
