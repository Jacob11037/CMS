


from django.urls import path
from . import views
from labtechnician.views import PrescriptionLabTestListAPIView
from django.utils import timezone
from .views import PatientListAPIView, DoctorListAPIView

urlpatterns = [
    # Lab Test Prescription Endpoints
    path('pending-tests/', views.PendingLabTestsView.as_view(), name='pending-lab-tests'),
    path('prescription-tests/', views.PendingPrescriptionLabTestsView.as_view(), name='prescription-lab-tests'),
    
    # Lab Report Endpoints
    path('generate-report/', views.GenerateLabReportView.as_view(), name='generate-lab-report'),
    path('reports/by-prescription/<int:prescription_id>/', 
         views.LabReportListByPrescriptionView.as_view(), 
         name='lab-reports-by-prescription'),
    path('reports/<int:report_id>/download/', 
         views.LabReportDownloadView.as_view(), 
         name='lab-report-download'),

    
    # Dashboard
    path('dashboard/', views.LabTechnicianDashboardView.as_view(), name='lab-technician-dashboard'),
    
    # Lab Test Management
    path('labtests/results/<int:pk>/', 
         views.LabTestResultDetailView.as_view(), 
         name='record-lab-test-result'),
    path('labtests/results/appointment/<int:appointment_id>/', 
         views.AppointmentLabTestResultsView.as_view(), 
         name='appointment-lab-results'),
    path('labtests/results/', 
         views.LabTestResultsByDateView.as_view(), 
         name='lab-results-by-date'),
    # Lab Test CRUD
    path('labtests/', views.LabTestListView.as_view(), name='labtest-list'),
    path('labtests/<int:pk>/', views.LabTestDetailView.as_view(), name='labtest-detail'),
    path('lab-tests/', views.PrescriptionLabTestListAPIView.as_view(), name='prescription-lab-tests'),

    path('api/patients/', PatientListAPIView.as_view(), name='patient-list'),
    path('api/doctors/', DoctorListAPIView.as_view(), name='doctor-list'),
]

  





#path('labtests/results/<int:lab_test_prescription_id>/', 
     #     views.LabTestResultDetailView.as_view(), 
     #     name='record-lab-test-result')


# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from . import views

# # Create a router instance
# router = DefaultRouter()
# router.register(r'labtests', views.PrescriptionLabTestViewSet, basename='prescription-labtest')

# urlpatterns = [
#     # Include all ViewSet routes
#     path('', include(router.urls)),

#     # Other views that are not related to labtests (keep them)
#     path('pending-tests/', views.PendingLabTestsView.as_view(), name='pending-lab-tests'),
#     path('prescription-tests/', views.PendingPrescriptionLabTestsView.as_view(), name='prescription-lab-tests'),
#     path('generate-report/', views.GenerateLabReportView.as_view(), name='generate-lab-report'),
#     path('reports/by-prescription/<int:prescription_id>/', views.LabReportListByPrescriptionView.as_view(), name='lab-reports-by-prescription'),
#     path('reports/<int:report_id>/download/', views.LabReportDownloadView.as_view(), name='lab-report-download'),
#     path('dashboard/', views.LabTechnicianDashboardView.as_view(), name='lab-technician-dashboard'),

#     # Other labtest results endpoints
#     path('labtests/results/appointment/<int:appointment_id>/', views.AppointmentLabTestResultsView.as_view(), name='appointment-lab-results'),
#     path('labtests/results/', views.LabTestResultsByDateView.as_view(), name='lab-results-by-date'),
# ]
