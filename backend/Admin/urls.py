from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorCreateView, RoleViewSet, UserDetailsViewSet, StaffViewSet, DepartmentViewSet, DoctorViewSet,
    PatientViewSet, AppointmentViewSet, AppointmentBillingViewSet, TokenViewSet,
    MedicineViewSet, MedicineStockViewSet, LabTestViewSet, ConsultationViewSet,
    PharmacistBillingViewSet, LabTechBillViewSet, PatientHistoryViewSet
)

# Create a router for automatic URL routing
router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'user-details', UserDetailsViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'appointment-billings', AppointmentBillingViewSet)
router.register(r'tokens', TokenViewSet)
router.register(r'medicines', MedicineViewSet)
router.register(r'medicine-stock', MedicineStockViewSet)
router.register(r'lab-tests', LabTestViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'pharmacist-billings', PharmacistBillingViewSet)
router.register(r'lab-tech-bills', LabTechBillViewSet)
router.register(r'patient-history', PatientHistoryViewSet)

urlpatterns = [
    path('doctors/', DoctorCreateView.as_view(), name='doctor-create'),

    path('api/', include(router.urls)),  # Include all API routes
]
