"""
Models based on the ERD: Department, Employee, Project.
"""
from django.db import models


class Department(models.Model):
    """Department entity: PK Dept. ID, FK Bldg. ID, Dept. Name."""
    dept_id = models.AutoField(primary_key=True)
    bldg_id = models.IntegerField()
    dept_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'department'
        ordering = ['dept_id']

    def __str__(self):
        return self.dept_name


class Employee(models.Model):
    """Employee entity: PK Emp. ID, FK Dept. ID, Emp. Name, Age, Sex."""
    emp_id = models.AutoField(primary_key=True)
    dept = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='employees',
        db_column='dept_id'
    )
    emp_name = models.CharField(max_length=50)
    emp_age = models.IntegerField()
    emp_sex = models.CharField(max_length=50)

    class Meta:
        db_table = 'employee'
        ordering = ['emp_id']

    def __str__(self):
        return self.emp_name


class Project(models.Model):
    """Project entity: PK Proj. ID, FK Emp. ID, FK Dept. ID, Proj. Name."""
    proj_id = models.AutoField(primary_key=True)
    emp = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='projects',
        db_column='emp_id'
    )
    dept = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='projects',
        db_column='dept_id'
    )
    proj_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'project'
        ordering = ['proj_id']

    def __str__(self):
        return self.proj_name
