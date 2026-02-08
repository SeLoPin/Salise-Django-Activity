# Generated manually for DRF Act 1 (ERD: Department, Employee, Project)

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Department',
            fields=[
                ('dept_id', models.AutoField(primary_key=True, serialize=False)),
                ('bldg_id', models.IntegerField()),
                ('dept_name', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'department',
                'ordering': ['dept_id'],
            },
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('emp_id', models.AutoField(primary_key=True, serialize=False)),
                ('emp_name', models.CharField(max_length=50)),
                ('emp_age', models.IntegerField()),
                ('emp_sex', models.CharField(max_length=50)),
                ('dept', models.ForeignKey(
                    db_column='dept_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='employees',
                    to='core.department'
                )),
            ],
            options={
                'db_table': 'employee',
                'ordering': ['emp_id'],
            },
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('proj_id', models.AutoField(primary_key=True, serialize=False)),
                ('proj_name', models.CharField(max_length=50)),
                ('emp', models.ForeignKey(
                    db_column='emp_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='projects',
                    to='core.employee'
                )),
                ('dept', models.ForeignKey(
                    db_column='dept_id',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='projects',
                    to='core.department'
                )),
            ],
            options={
                'db_table': 'project',
                'ordering': ['proj_id'],
            },
        ),
    ]
