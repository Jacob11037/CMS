from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from .models import Appointment, Patient, Prescription, PrescriptionBill, ConsultationBill, Doctor, Department, \
    Receptionist, MedicalHistory, PrescriptionLabTest, LabTest, PrescriptionMedicine, Medicine
from .permissions import IsDoctor, IsReceptionist
from .serializers import AppointmentSerializer, PatientSerializer, PrescriptionSerializer, PrescriptionBillSerializer, \
    ConsultationBillSerializer, DoctorSerializer, ReceptionistSerializer, DoctorViewSerializer, DepartmentSerializer, \
    ReceptionistViewSerializer, MedicalHistorySerializer, MedicineSerializer, LabTestSerializer
from rest_framework.pagination import PageNumberPagination



# Create your views here.

from rest_framework.response import Response
from rest_framework import status

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def create(self, request, *args, **kwargs):
        patient_id = request.data.get('patient')
        doctor_id = request.data.get('doctor')
        appointment_id = request.data.get('appointment')
        diagnosis = request.data.get('diagnosis')
        medical_notes = request.data.get('notes')
        medicines_data = request.data.get('medicines', [])  # List of medicine objects with dosage and frequency
        lab_tests_data = request.data.get('lab_tests', [])  # List of lab test objects with test_date

        # Create the prescription
        prescription = Prescription.objects.create(
            patient_id=patient_id,
            doctor_id=doctor_id,
            appointment_id=appointment_id,
            notes=medical_notes
        )

        # Add medicines with dosage and frequency
        for medicine_data in medicines_data:
            PrescriptionMedicine.objects.create(
                prescription=prescription,
                medicine_id=medicine_data['id'],
                dosage=medicine_data['dosage'],
                frequency=medicine_data['frequency']
            )

        # Add lab tests with test_date
        for lab_test_data in lab_tests_data:
            PrescriptionLabTest.objects.create(
                prescription=prescription,
                lab_test_id=lab_test_data['id'],
                test_date=lab_test_data['test_date']
            )

        # Create medical history
        medical_history = MedicalHistory.objects.create(
            patient_id=patient_id,
            diagnosis=diagnosis,
            medical_notes=medical_notes,
            prescription=prescription
        )

        serializer = self.get_serializer(prescription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class MedicalHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Retrieve medical history for patients assigned to the requesting doctor's account.
        """
        user = self.request.user
        doctor = Doctor.objects.filter(user=user).first()

        if not doctor:
            raise PermissionDenied("You are not assigned as a doctor.")  # Handle if the user is not a doctor

        # Get all appointments for the doctor
        appointments = Appointment.objects.filter(doctor=doctor)

        # Get all patients from those appointments
        patient_ids = appointments.values_list('patient', flat=True).distinct()

        # Filter MedicalHistory based on those patients
        queryset = MedicalHistory.objects.filter(patient__in=patient_ids)

        # Optional: filter by patient_id if provided in query params
        patient_id = self.request.query_params.get('patient_id')
        if patient_id:
            try:
                patient_id = patient_id  # Convert to integer
                queryset = queryset.filter(patient_id=patient_id)
            except ValueError:
                # Optionally, raise an error if invalid patient_id format is provided
                raise ValidationError("Invalid patient_id provided.")

        return queryset

@permission_classes([IsAuthenticated])
class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'phone', 'email']

@permission_classes([IsAuthenticated])
class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all()

    def get_queryset(self):
        user = self.request.user

        # Check if the user is a doctor
        if Doctor.objects.filter(user=user).exists():
            doctor = Doctor.objects.get(user=user)
            return Appointment.objects.filter(doctor__staff_id=doctor.staff_id)

        # Check if the user is a receptionist
        if Receptionist.objects.filter(user=user).exists():
            return Appointment.objects.all()

        # If the user is neither, return an empty queryset (or raise a permission error)
        raise PermissionDenied("You do not have permission to view appointments.")



class PrescriptionBillViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionBill.objects.all()
    serializer_class = PrescriptionBillSerializer

class ConsultationBillViewSet(viewsets.ModelViewSet):
    queryset = ConsultationBill.objects.all()
    serializer_class = ConsultationBillSerializer

class DoctorListViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorViewSerializer

    def get_queryset(self):
        # Fetch doctors with only the required fields
        return Doctor.objects.all()

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
        raise PermissionDenied("You are not authorized to access this profile")

class DepartmentReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

@api_view(['POST'])
def register_receptionist(request):
    # permission_classes = []

    # if request.user.is_authenticated and request.user.is_superuser:
    if request.method == 'POST':
        serializer = ReceptionistSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Receptionist registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"message": "Unauthorized"}, status=401)

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_role(request):
    user = request.user

    if Receptionist.objects.filter(user=user).exists():
        return JsonResponse({'role': 'receptionist'}, status=200)
    elif Doctor.objects.filter(user=user).exists():
        return JsonResponse({'role': 'doctor'}, status=200)
    else:
        return JsonResponse({'role': 'unknown'}, status=200)

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer

class ReceptionistViewSet(viewsets.ModelViewSet):
    permission_classes = []
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistViewSerializer



    