from rest_framework import viewsets
from api.models import Admin, Pharmacist, Doctor, Receptionist, LabTechnician
from .serializers import AdminSerializer
from api.serializers import DoctorSerializer,ReceptionistSerializer
# from labtechnician.serializers import LabTechnicianSerializer
# from pharmacist.serializers import PharmacistSerializer
from .permissions import IsAdmin, IsPharmacist, IsDoctor, IsReceptionist, IsLabTechnician

# Admin View
class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    # permission_classes = [IsAdmin]  # Only Admins can access


# # Pharmacist View
# class PharmacistViewSet(viewsets.ModelViewSet):
#     queryset = Pharmacist.objects.all()
#     serializer_class = PharmacistSerializer
#     # permission_classes = [IsPharmacist]  # Only Pharmacists can access


# Doctor View
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    # permission_classes = [IsDoctor]  # Only Doctors can access


# Receptionist View
class ReceptionistViewSet(viewsets.ModelViewSet):
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistSerializer
    # permission_classes = [IsReceptionist]  # Only Receptionists can access


# Lab Technician View
# class LabTechnicianViewSet(viewsets.ModelViewSet):
#     queryset = LabTechnician.objects.all()
#     serializer_class = LabTechnicianSerializer
    # permission_classes = [IsLabTechnician]  # Only Lab Technicians can access
