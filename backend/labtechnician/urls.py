# from django.urls import path
# from .views import (
#     PendingPrescriptionLabTestsView,
#     GenerateLabReportView,
#     LabReportDetailView,
#     LabReportListByPrescriptionView,
#     LabTechnicianDashboardView,
# )

# urlpatterns = [
#     # Lab Technician URLs
#     path('lab/pending-tests/', 
#          PendingPrescriptionLabTestsView.as_view(), 
#          name='pending-lab-tests'),
    
#     path('lab/generate-report/', 
#          GenerateLabReportView.as_view(), 
#          name='generate-lab-report'),
    
#     path('lab/dashboard/', 
#          LabTechnicianDashboardView.as_view(), 
#          name='lab-tech-dashboard'),

#     # Doctor URLs
#     path('doctor/prescriptions/<int:prescription_id>/lab-reports/', 
#          LabReportListByPrescriptionView.as_view(), 
#          name='prescription-lab-reports'),
    
#     # Shared URLs
#     path('reports/<int:pk>/', 
#          LabReportDetailView.as_view(), 
#          name='lab-report-detail'),
# ]



# from django.urls import path
# from . import views

# urlpatterns = [
#     # 4.1 Lab Test Prescription Management
#     path('api/labtests/results/<int:lab_test_prescription_id>/', 
#          views.LabTestResultDetailView.as_view(), 
#          name='record-lab-test-result'),  # PUT
    
#     path('api/labtests/results/appointment/<int:appointment_id>/', 
#          views.AppointmentLabTestResultsView.as_view(), 
#          name='appointment-lab-results'),  # GET
    
#     path('api/labtests/results/', 
#          views.LabTestResultsByDateView.as_view(), 
#          name='lab-results-by-date'),  # GET with query params
    
#     path('api/labtests/<int:lab_test_prescription_id>/deactivate/', 
#          views.DeactivateLabTestPrescriptionView.as_view(), 
#          name='deactivate-lab-prescription'),  # PATCH

#     # 4.2 Lab Test Management
#     path('api/labtests/', 
#          views.LabTestListView.as_view(), 
#          name='labtest-list'),  # GET (list) & POST (create)
    
#     path('api/labtests/<int:lab_test_id>/', 
#          views.LabTestDetailView.as_view(), 
#          name='labtest-detail'),  # GET & PUT
    
#     path('api/labtests/<int:lab_test_id>/deactivate/', 
#          views.DeactivateLabTestView.as_view(), 
#          name='deactivate-lab-test'),  # PATCH
# ]

# from django.urls import path
# from . import views

# urlpatterns = [
    # 4.1 Lab Test Prescription Management
#     path('labtests/results/<int:lab_test_prescription_id>/',
#          views.LabTestResultDetailView.as_view(),
#          name='record-lab-test-result'),  # PUT
    
#     path('labtests/results/appointment/<int:appointment_id>/',
#          views.AppointmentLabTestResultsView.as_view(),
#          name='appointment-lab-results'),  # GET
    
#     path('labtests/results/',
#          views.LabTestResultsByDateView.as_view(),
#          name='lab-results-by-date'),  # GET with query params
    
#     path('labtests/<int:lab_test_prescription_id>/deactivate/',
#          views.DeactivateLabTestPrescriptionView.as_view(),
#          name='deactivate-lab-prescription'),  # PATCH

    # 4.2 Lab Test Management
#     path('labtests/',
#          views.LabTestListView.as_view(),
#          name='labtest-list'),  # GET (list) & POST (create)
    
#     path('labtests/<int:lab_test_id>/',
#          views.LabTestDetailView.as_view(),
#          name='labtest-detail'),  # GET & PUT
    
#     path('labtests/<int:lab_test_id>/deactivate/',
#          views.DeactivateLabTestView.as_view(),
#          name='deactivate-lab-test'),  # PATCH

#     # Lab Report Management
#     path('lab-reports/',
#          views.GenerateLabReportView.as_view(),
#          name='lab-report-create'),
    
#     path('lab-reports/prescription/<int:prescription_id>/',
#          views.LabReportListByPrescriptionView.as_view(),
#          name='lab-reports-by-prescription'),
    
#     path('lab-reports/<int:pk>/',
#          views.LabReportDetailView.as_view(),
#          name='lab-report-detail'),
    
#     # Lab Technician Management
#     path('lab-technicians/',
#          views.LabTechnicianListView.as_view(),
#          name='lab-technician-list'),
    
#     path('lab-technicians/<str:staff_id>/',
#          views.LabTechnicianDetailView.as_view(),
#          name='lab-technician-detail'),
    
#     # Dashboard
#     path('lab-dashboard/',
#          views.LabTechnicianDashboardView.as_view(),
#          name='lab-technician-dashboard'),
# ]


from django.urls import path
from . import views
# from django.utils import timezone

urlpatterns = [
    # Lab Test Prescription Endpoints
    path('pending-tests/', views.PendingLabTestsView.as_view(), name='pending-lab-tests'),
    path('prescription-tests/', views.PendingPrescriptionLabTestsView.as_view(), name='prescription-lab-tests'),
    
    # Lab Report Endpoints
    path('generate-report/', views.GenerateLabReportView.as_view(), name='generate-lab-report'),
    path('reports/by-prescription/<int:prescription_id>/', 
         views.LabReportListByPrescriptionView.as_view(), 
         name='lab-reports-by-prescription'),
    
    # Dashboard
    path('dashboard/', views.LabTechnicianDashboardView.as_view(), name='lab-technician-dashboard'),
    
    # Lab Test Management
    path('labtests/results/<int:lab_test_prescription_id>/', 
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
  
]
#path('labtests/results/<int:lab_test_prescription_id>/', 
     #     views.LabTestResultDetailView.as_view(), 
     #     name='record-lab-test-result')
