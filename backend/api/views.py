from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.views import APIView

from .models import Appointment, Patient, Prescription, Bill, ConsultationBill, Doctor, Department, \
    Receptionist, MedicalHistory, PrescriptionLabTest, LabTest, PrescriptionMedicine, Medicine
from .permissions import IsDoctor, IsReceptionist, IsAdmin
from labtechnician.permissions import IsLabTechnician
from .serializers import AppointmentSerializer, PatientSerializer, PrescriptionSerializer, BillSerializer, \
    ConsultationBillSerializer, DoctorSerializer, ReceptionistSerializer, DoctorViewSerializer, DepartmentSerializer, \
    ReceptionistViewSerializer, MedicalHistorySerializer, MedicineSerializer, LabTestSerializer, BillCreateSerializer
from django_filters.rest_framework import DjangoFilterBackend

from .utils.filters import AppointmentFilter, BillFilter
from .utils.pagination import LimitTenPagination
from .utils.roles import get_user_role


class PrescriptionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDoctor | IsAdmin]
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer

    def create(self, request, *args, **kwargs):
        print(request.data)
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
                frequency=medicine_data['frequency'],
                duration = medicine_data['duration']

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
            prescription=prescription
        )

        serializer = self.get_serializer(prescription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_prescriptions_by_patient(request, patient_id):
    try:
        prescriptions = Prescription.objects.filter(patient__id=patient_id)
        serializer = PrescriptionSerializer(prescriptions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MedicalHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalHistorySerializer
    permission_classes = [IsAdmin | IsDoctor]

    def get_queryset(self):
        """
        Admins can view all medical histories.
        Doctors can only view medical histories of their assigned patients.
        """
        user = self.request.user
        role = get_user_role(user)

        if role == "admin":
            queryset= MedicalHistory.objects.all().select_related(
                'prescription'
            ).prefetch_related(
                'prescription__prescriptionmedicine_set',
                'prescription__prescriptionlabtest_set'
            )
            patient_id = self.request.query_params.get('patient_id')
            if patient_id:
                try:
                    patient_id = int(patient_id)
                    queryset = queryset.filter(patient_id=patient_id)
                except ValueError:
                    raise ValidationError("Invalid patient_id provided.")
            return queryset

        elif role == "doctor":
            doctor = Doctor.objects.filter(user=user).first()
            if not doctor:
                raise PermissionDenied("You are not assigned as a doctor.")

            appointments = Appointment.objects.filter(doctor=doctor)
            patient_ids = appointments.values_list('patient', flat=True).distinct()

            queryset = MedicalHistory.objects.filter(patient__in=patient_ids).select_related(
                'prescription'
            ).prefetch_related(
                'prescription__prescriptionmedicine_set',
                'prescription__prescriptionlabtest_set'
            )

            # Optional filtering by patient_id from query params
            patient_id = self.request.query_params.get('patient_id')
            if patient_id:
                try:
                    patient_id = int(patient_id)
                    queryset = queryset.filter(patient_id=patient_id)
                except ValueError:
                    raise ValidationError("Invalid patient_id provided.")

            return queryset

        else:
            raise PermissionDenied("You do not have access to view medical histories.")

class PatientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDoctor | IsReceptionist | IsAdmin]
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'phone', 'email']

class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDoctor | IsReceptionist | IsAdmin]
    serializer_class = AppointmentSerializer
    queryset = Appointment.objects.all().order_by('-start_time')
    pagination_class = LimitTenPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = AppointmentFilter
    search_fields = ['doctor__name', 'patient__name']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.is_superuser or user.groups.filter(name="Admin").exists():
            return queryset

        # Check if the user is a doctor
        if Doctor.objects.filter(user=user).exists():
            doctor = Doctor.objects.get(user=user)
            return queryset.filter(doctor__staff_id=doctor.staff_id)

        # Check if the user is a receptionist
        if Receptionist.objects.filter(user=user).exists():
            return queryset

        # If the user is neither, return an empty queryset (or raise a permission error)
        raise PermissionDenied("You do not have permission to view appointments.")

    def perform_create(self, serializer):
        appointment = serializer.save()
        doctor = appointment.doctor

        try:
            department = doctor.department_id
            price = department.fee if department and department.fee else 500.00
        except ObjectDoesNotExist:
            # Fallback if somehow doctor has no department
            price = 500.00

        # Create consultation bill
        ConsultationBill.objects.create(
            appointment=appointment,
            amount=price
        )


class BillViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDoctor | IsReceptionist | IsAdmin]
    queryset = Bill.objects.all().order_by('-bill_date')
    pagination_class = LimitTenPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = BillFilter

    def get_serializer_class(self):
        if self.action == 'create':
            return BillCreateSerializer
        return BillSerializer


class ConsultationBillViewSet(viewsets.ModelViewSet):
    permission_classes = [IsReceptionist | IsAdmin]

    queryset = ConsultationBill.objects.all().order_by("-id")
    serializer_class = ConsultationBillSerializer

class DoctorListViewSet(viewsets.ModelViewSet):
    permission_classes = [IsReceptionist | IsAdmin]

    queryset = Doctor.objects.all()
    serializer_class = DoctorViewSerializer

    def get_queryset(self):
        # Fetch doctors with only the required fields
        return Doctor.objects.all()

class DoctorAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'staff_id']

@api_view(['GET'])
@permission_classes([IsReceptionist | IsAdmin])
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
@permission_classes([IsDoctor | IsAdmin])
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
    permission_classes = [IsReceptionist | IsAdmin]

    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class DepartmentAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdmin]  # Only admins can access
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

@api_view(['POST'])
@permission_classes([IsAdmin])
def register_receptionist(request):
    if request.method == 'POST':
        serializer = ReceptionistSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                receptionist = serializer.save()
                receptionist_group, created = Group.objects.get_or_create(name = 'Receptionist')
                receptionist.user.groups.add(receptionist_group)
            return Response({"message": "Receptionist registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"message": "Unauthorized"}, status=401)

@api_view(['POST'])
@permission_classes([IsAdmin])
def register_doctor(request):
    if request.method == 'POST':
        serializer = DoctorSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                doctor = serializer.save()
                doctor_group, created = Group.objects.get_or_create(name='Doctor')
                doctor.user.groups.add(doctor_group)
            return Response({"message": "Doctor registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({"message": "Unauthorized"}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_user_role(request):
    user = request.user
    groups = user.groups.all().values_list('name', flat=True)

    if user.is_superuser or 'Admin' in groups:
        return JsonResponse({'role': 'admin'}, status=200)
    elif 'Receptionist' in groups:
        return JsonResponse({'role': 'receptionist'}, status=200)
    elif 'Doctor' in groups:
        return JsonResponse({'role': 'doctor'}, status=200)
    elif 'Pharmacist' in groups:
        return JsonResponse({'role': 'pharmacist'}, status=200)
    elif 'LabTechnician' in groups:
        return JsonResponse({'role': 'labtechnician'}, status=200)
    else:
        return JsonResponse({'role': 'unknown'}, status=200)


class MedicineViewSet(viewsets.ModelViewSet):
    permission_classes = [IsDoctor | IsAdmin]

    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class LabTestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsLabTechnician | IsAdmin | IsDoctor]

    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer

class ReceptionistViewSet(viewsets.ModelViewSet):
    permission_classes = [IsReceptionist | IsAdmin]
    queryset = Receptionist.objects.all()
    serializer_class = ReceptionistViewSerializer



    