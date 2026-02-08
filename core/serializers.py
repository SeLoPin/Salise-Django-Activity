"""
DRF serializers for Department, Employee, and Project.
"""
from rest_framework import serializers
from .models import Department, Employee, Project


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['dept_id', 'bldg_id', 'dept_name']


class EmployeeSerializer(serializers.ModelSerializer):
    dept_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='dept'
    )

    class Meta:
        model = Employee
        fields = ['emp_id', 'dept_id', 'emp_name', 'emp_age', 'emp_sex']


class ProjectSerializer(serializers.ModelSerializer):
    emp_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        source='emp'
    )
    dept_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='dept'
    )

    class Meta:
        model = Project
        fields = ['proj_id', 'emp_id', 'dept_id', 'proj_name']
