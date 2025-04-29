# clinic/views.py

from rest_framework import generics
from api.models import Receptionist,Doctor,Pharmacist,LabTechnician
from .serializers import ReceptionistSerializer

class ReceptionistListCreateView(generics.ListCreateAPIView):
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistSerializer

class ReceptionistRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistSerializer
    lookup_field = 'id'




from rest_framework import generics
from api.models import Doctor
from .serializers import DoctorSerializer

class DoctorListCreateView(generics.ListCreateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

class DoctorRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer





from rest_framework import generics
from api.models import Pharmacist
from .serializers import PharmacistSerializer

class PharmacistListCreateView(generics.ListCreateAPIView):
    queryset = Pharmacist.objects.all()
    serializer_class = PharmacistSerializer

class PharmacistRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pharmacist.objects.all()
    serializer_class = PharmacistSerializer
    lookup_field = 'pk'






from rest_framework import generics
from api.models import LabTechnician
from .serializers import LabTechnicianSerializer

class LabTechnicianListCreateView(generics.ListCreateAPIView):
    queryset = LabTechnician.objects.all()
    serializer_class = LabTechnicianSerializer

class LabTechnicianRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabTechnician.objects.all()
    serializer_class = LabTechnicianSerializer
    lookup_field = 'pk'




from rest_framework import generics
from api.models import Admin
from .serializers import AdminSerializer

class AdminListCreateView(generics.ListCreateAPIView):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer

class AdminRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer





from rest_framework import generics
from api.models import Medicine
from .serializers import MedicineSerializer

class MedicineListCreateView(generics.ListCreateAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class MedicineRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer





from rest_framework import generics
from api.models import LabTest
from .serializers import LabTestSerializer

class LabTestListCreateView(generics.ListCreateAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer

class LabTestRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer




from rest_framework import generics
from api.models import Department
from .serializers import DepartmentSerializer

class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class DepartmentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    lookup_field = 'pk'
