# Generated by Django 5.1.6 on 2025-03-15 10:26

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_medicalhistory_diagnosis_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='appointment',
            name='doctor',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.doctor', to_field='staff_id'),
        ),
        migrations.AlterField(
            model_name='medicalhistory',
            name='prescription',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='medical_history', to='api.prescription'),
        ),
    ]
