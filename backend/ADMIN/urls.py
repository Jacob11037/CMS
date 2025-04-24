from django.urls import path
from .views import (
    ReceptionistListCreateView, ReceptionistRetrieveUpdateDestroyView,
    DoctorListCreateView, DoctorRetrieveUpdateDestroyView,
    PharmacistListCreateView, PharmacistRetrieveUpdateDestroyView,
    LabTechnicianListCreateView, LabTechnicianRetrieveUpdateDestroyView,
    AdminListCreateView, AdminRetrieveUpdateDestroyView,
    MedicineListCreateView, MedicineRetrieveUpdateDestroyView,
    LabTestListCreateView, LabTestRetrieveUpdateDestroyView
)

urlpatterns = [
    # Receptionist
    path('receptionists/', ReceptionistListCreateView.as_view(), name='receptionist-list-create'),
    path('receptionists/<int:pk>/', ReceptionistRetrieveUpdateDestroyView.as_view(), name='receptionist-detail'),

    # Doctor
    path('doctors/', DoctorListCreateView.as_view(), name='doctor-list-create'),
    path('doctors/<int:pk>/', DoctorRetrieveUpdateDestroyView.as_view(), name='doctor-detail'),

    # Pharmacist
    path('pharmacists/', PharmacistListCreateView.as_view(), name='pharmacist-list-create'),
    path('pharmacists/<int:pk>/', PharmacistRetrieveUpdateDestroyView.as_view(), name='pharmacist-detail'),

    # Lab Technician
    path('labtechnicians/', LabTechnicianListCreateView.as_view(), name='labtechnician-list-create'),
    path('labtechnicians/<int:pk>/', LabTechnicianRetrieveUpdateDestroyView.as_view(), name='labtechnician-detail'),

    # Admin
    path('admins/', AdminListCreateView.as_view(), name='admin-list-create'),
    path('admins/<int:pk>/', AdminRetrieveUpdateDestroyView.as_view(), name='admin-detail'),

    # Medicine
    path('medicines/', MedicineListCreateView.as_view(), name='medicine-list-create'),
    path('medicines/<int:pk>/', MedicineRetrieveUpdateDestroyView.as_view(), name='medicine-detail'),

    # Lab Test
    path('lab-tests/', LabTestListCreateView.as_view(), name='labtest-list-create'),
    path('lab-tests/<int:pk>/', LabTestRetrieveUpdateDestroyView.as_view(), name='labtest-detail'),
]
