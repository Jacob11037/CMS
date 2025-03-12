from django.urls import path, include
from rest_framework.routers import DefaultRouter

from api import views
from api.views import DepartmentReadOnlyViewSet, register_doctor, register_receptionist, \
    DoctorListReadOnlyViewSet, doctor_profile, receptionist_profile

# Initialize the router
router = DefaultRouter()

# Register your viewsets
router.register(r'prescriptions', views.PrescriptionViewSet)
router.register(r'patients', views.PatientViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'prescription-bills', views.PrescriptionBillViewSet)
router.register(r'consultation-bills', views.ConsultationBillViewSet)


#View only
router.register(r'doctors', DoctorListReadOnlyViewSet, basename='doctor')
router.register(r'departments', DepartmentReadOnlyViewSet, basename='department')

urlpatterns = [
    path('', include(router.urls)),

    path('doctor/register/', register_doctor, name='doctor-register'),
    path('receptionist/register/', register_receptionist, name='receptionist-register'),
    path('doctor/profile/', doctor_profile, name='doctor-profile'),
    path('receptionist/profile/', receptionist_profile, name='doctor-receptionist'),

    path('auth/', include('djoser.urls')),  # Registration, password reset, etc.
    path('auth/token/', include('djoser.urls.jwt')),  # JWT-based token login

]
