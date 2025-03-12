from django.http import JsonResponse
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Appointment, Patient, Prescription, PrescriptionBill, ConsultationBill, Doctor, Department, \
    Receptionist
from .permissions import IsDoctor, IsReceptionist
from .serializers import AppointmentSerializer, PatientSerializer, PrescriptionSerializer, PrescriptionBillSerializer, \
    ConsultationBillSerializer, DoctorSerializer, ReceptionistSerializer, DoctorViewSerializer, DepartmentSerializer, \
    ReceptionistViewSerializer
from rest_framework.pagination import PageNumberPagination



# Create your views here.

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    # permission_classes = [IsAuthenticated]  # Example: If you want authentication

    # You can customize querysets or actions if needed, e.g., filtering by date
    def get_queryset(self):
        queryset = Patient.objects.all()
        date_of_birth = self.request.query_params.get('date_of_birth', None)
        if date_of_birth:
            queryset = queryset.filter(date_of_birth=date_of_birth)
        return queryset


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    # permission_classes = [IsAuthenticated]

    # Add any custom query parameters, e.g., doctor_name, appointment_date
    def get_queryset(self):
        queryset = Appointment.objects.all()
        doctor_name = self.request.query_params.get('doctor_name', None)
        appointment_date = self.request.query_params.get('appointment_date', None)
        status = self.request.query_params.get('status', None)

        if doctor_name:
            queryset = queryset.filter(doctor_name__icontains=doctor_name)
        if appointment_date:
            queryset = queryset.filter(appointment_date__date=appointment_date)
        if status:
            queryset = queryset.filter(status=status)

        return queryset

class PrescriptionBillViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionBill.objects.all()
    serializer_class = PrescriptionBillSerializer

class ConsultationBillViewSet(viewsets.ModelViewSet):
    queryset = ConsultationBill.objects.all()
    serializer_class = ConsultationBillSerializer

class DoctorListReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorViewSerializer
    permission_classes = [IsAuthenticated]  # Ensure authentication is required

@api_view(['GET'])
@permission_classes([IsReceptionist])
def receptionist_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)

    try:
        receptionist = Receptionist.objects.get(user=request.user)
        serializer = ReceptionistViewSerializer(receptionist)
        return JsonResponse(serializer.data, status=200)
    except Receptionist.DoesNotExist:
        raise PermissionDenied("You are not authorized to access this profile")

@api_view(['GET'])
@permission_classes([IsDoctor])
def doctor_profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User not authenticated"}, status=401)
    try:
        doctor = Doctor.objects.get(user=request.user)
        serializer = DoctorViewSerializer(doctor)
        return JsonResponse(serializer.data, status=200)
    except Doctor.DoesNotExist:
        return JsonResponse({"error": "Doctor profile not found"}, status=404)

class DepartmentReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_receptionist(request):
    # if request.user.is_authenticated and request.user.is_superuser:
    if request.method == 'POST':
        serializer = ReceptionistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Receptionist registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"message": "Unauthorized"}, status=401)

# Create Doctor API endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_doctor(request):
    # if request.user.is_authenticated and request.user.is_superuser:
    if request.method == 'POST':
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Doctor registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"message": "Unauthorized"}, status=401)
