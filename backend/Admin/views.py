from rest_framework import viewsets, permissions, generics
# from .models import (
#     Role, User_Details, Staff, Department, Doctor, Patient, Appointment,
#     Appointment_Billing, Token, Medicine, Medicine_Stock, Lab_Test,
#     Consultation, Pharmacist_Billing, LabTech_Bill, Patient_History
# )

from api.serializers import AppointmentSerializer, PatientSerializer, PrescriptionSerializer
from CMS.backend.api.views import PrescriptionViewSet
from api.models import Appointment, Doctor,Department, LabTest, Medicine, Patient
from .serializers import (
    RoleSerializer, UserDetailsSerializer, StaffSerializer, DepartmentSerializer,
    AppointmentBillingSerializer, TokenSerializer, MedicineSerializer,DoctorSerializer,
    MedicineStockSerializer, LabTestSerializer, ConsultationSerializer,
    PharmacistBillingSerializer, LabTechBillSerializer, PatientHistorySerializer
)

# class RoleViewSet(viewsets.ModelViewSet):
#     queryset = Role.objects.all()
#     serializer_class = RoleSerializer
#     permission_classes = [permissions.IsAuthenticated]

# class UserDetailsViewSet(viewsets.ModelViewSet):
#     queryset = User_Details.objects.all()
#     serializer_class = UserDetailsSerializer
#     permission_classes = [permissions.IsAuthenticated]

# class StaffViewSet(viewsets.ModelViewSet):
#     queryset = Staff.objects.all()
#     serializer_class = StaffSerializer
#     permission_classes = [permissions.IsAuthenticated]

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

class DoctorCreateView(generics.CreateAPIView):  # Ensure it's CreateAPIView
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

# class AppointmentBillingViewSet(viewsets.ModelViewSet):
#     queryset = Appointment_Billing.objects.all()
#     serializer_class = AppointmentBillingSerializer
#     permission_classes = [permissions.IsAuthenticated]

# class TokenViewSet(viewsets.ModelViewSet):
#     queryset = Token.objects.all()
#     serializer_class = TokenSerializer
#     permission_classes = [permissions.IsAuthenticated]

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

# class MedicineStockViewSet(viewsets.ModelViewSet):
#     queryset = Medicine_Stock.objects.all()
#     serializer_class = MedicineStockSerializer
#     permission_classes = [permissions.IsAuthenticated]

class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]

class PrescritionViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionViewSet.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

# class PharmacistBillingViewSet(viewsets.ModelViewSet):
#     queryset = Pharmacist_Billing.objects.all()
#     serializer_class = PharmacistBillingSerializer
#     permission_classes = [permissions.IsAuthenticated]

# class LabTechBillViewSet(viewsets.ModelViewSet):
#     queryset = LabTech_Bill.objects.all()
#     serializer_class = LabTechBillSerializer
#     permission_classes = [permissions.IsAuthenticated]

# class PatientHistoryViewSet(viewsets.ModelViewSet):
#     queryset = Patient_History.objects.all()
#     serializer_class = PatientHistorySerializer
#     permission_classes = [permissions.IsAuthenticated]
