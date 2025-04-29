from django.contrib import admin
from .models import LabReport,LabReportTestResult

# Register your models here.
admin.site.register(LabReport)
admin.site.register(LabReportTestResult)