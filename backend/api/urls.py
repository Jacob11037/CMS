from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api import views
from api.views import (
    DepartmentReadOnlyViewSet, register_doctor, register_receptionist,
     doctor_profile, receptionist_profile, check_user_role,
    MedicalHistoryViewSet, MedicineViewSet, LabTestViewSet, DoctorListViewSet  # Import the new viewsets
)

# Initialize the router
router = DefaultRouter()

# Register your viewsets
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'patients', views.PatientViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'prescription-bills', views.PrescriptionBillViewSet)
router.register(r'consultation-bills', views.ConsultationBillViewSet)
router.register(r'medical-history', MedicalHistoryViewSet, basename='medical-history')
router.register(r'medicines', MedicineViewSet, basename='medicine')  # Register MedicineViewSet
router.register(r'lab-tests', LabTestViewSet, basename='lab-test')  # Register LabTestViewSet
router.register(r'doctors', DoctorListViewSet, basename='doctor')
router.register(r'receptionists', views.ReceptionistViewSet)




router.register(r'departments', DepartmentReadOnlyViewSet, basename='department')

urlpatterns = [
    path('', include(router.urls)),

    # Authentication-related routes
    path('auth/check-role/', check_user_role, name='check-user-role'),
    path('auth/', include('djoser.urls')),  # Registration, password reset, etc.
    path('auth/token/', include('djoser.urls.jwt')),  # JWT-based authentication

    # User management endpoints
    path('doctor/register/', register_doctor, name='doctor-register'),
    path('receptionist/register/', register_receptionist, name='receptionist-register'),
    path('doctor/profile/', doctor_profile, name='doctor-profile'),
    path('receptionist/profile/', receptionist_profile, name='receptionist-profile'),
]