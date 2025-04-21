# api/serializers.py
from datetime import datetime
from warnings import catch_warnings

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Appointment, PrescriptionLabTest, PrescriptionMedicine, Prescription, ConsultationBill, \
    Bill, Doctor, Receptionist, Department, MedicalHistory, Medicine, LabTest, Patient


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

    def validate_phone(self, value):
        """
        Custom validation for phone number format.
        """
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Invalid phone number format.")
        return value


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.first_name", read_only=True)
    patient_name = serializers.SerializerMethodField(read_only=True)
    doctor = serializers.SlugRelatedField(
        slug_field='staff_id',  # Use staff_id as the unique identifier
        queryset=Doctor.objects.all()
    )

    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'doctor_name', 'patient', 'patient_name', 'start_time', 'end_time', 'status']

    def get_patient_name(self, obj):
        """Custom method to return the patient's full name."""
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def validate(self, data):
        now = timezone.now()
        max_future_date = now + timezone.timedelta(days=3)

        # Skip validation for partial updates (e.g., PATCH only status)
        if self.partial and 'status' in data and len(data) == 1:
            return data

        # Start/End Time Validation
        start_time = data.get('start_time', self.instance.start_time if self.instance else None)
        end_time = data.get('end_time', self.instance.end_time if self.instance else None)

        if start_time < now:
            raise serializers.ValidationError("Start time cannot be in the past.")
        if start_time > max_future_date:
            raise serializers.ValidationError("Start time cannot be more than 3 days in the future.")
        if end_time <= start_time:
            raise serializers.ValidationError("End time must be after start time.")

        # Overlap Validation (only for new/full updates)
        if not self.partial:
            overlapping = Appointment.objects.filter(
                doctor=data.get('doctor', self.instance.doctor if self.instance else None),
                start_time__date=start_time.date(),
                end_time__gte=start_time,
                start_time__lte=end_time,
                status='Pending'
            ).exclude(id=self.instance.id if self.instance else None)

            if overlapping.exists():
                raise serializers.ValidationError("Time slot already booked with a pending appointment.")

        return data


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.medicine_name')
    medicine_id = serializers.PrimaryKeyRelatedField(source='medicine', read_only=True)

    class Meta:
        model = PrescriptionMedicine
        fields = ['medicine_id', 'medicine_name', 'dosage', 'frequency', 'quantity']

class PrescriptionLabTestSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(source='lab_test.test_name')
    test_id = serializers.PrimaryKeyRelatedField(source='lab_test', read_only=True)

    class Meta:
        model = PrescriptionLabTest
        fields = ['test_id', 'test_name', 'test_date']  # Include test date


class PrescriptionSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all())  # Accepts patient ID
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())  # Accepts doctor ID
    medicines = PrescriptionMedicineSerializer(many=True, source='prescriptionmedicine_set')  # Include medicines
    lab_tests = PrescriptionLabTestSerializer(many=True, source='prescriptionlabtest_set')  # Include lab tests

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'doctor', 'appointment', 'medicines', 'lab_tests', 'notes']


class MedicalHistorySerializer(serializers.ModelSerializer):
    prescription = PrescriptionSerializer()  # Include the nested Prescription object

    class Meta:
        model = MedicalHistory
        fields = ['id', 'patient', 'diagnosis', 'prescription']  # Include prescription field




class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class BillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bill
        fields = '__all__'

class ConsultationBillSerializer(serializers.ModelSerializer):  # Renamed from AppointmentBillSerializer
    class Meta:
        model = ConsultationBill
        fields = '__all__'


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class DoctorViewSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()  # Custom field for department name

    class Meta:
        model = Doctor
        fields = ['staff_id', 'first_name', 'last_name', 'department_id', 'department_name', 'email', 'phone']

    def get_department_name(self, obj):
        # Fetch the department name using the department_id
        return obj.department_id.department_name

class ReceptionistViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receptionist
        fields = '__all__'


class ReceptionistSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)  # Handle username separately
    password = serializers.CharField(write_only=True)  # Hide password from responses

    class Meta:
        model = Receptionist
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'phone', 'address', 'sex', 'is_active', 'joining_date',
                  'salary', 'date_of_birth']

    def create(self, validated_data):
        try:
            with transaction.atomic():
                username = validated_data.pop('username')
                password = validated_data.pop('password')

                # Create a new User instance
                user = User.objects.create(username=username)
                user.set_password(password)  # Hash the password properly
                user.save()

                receptionist = Receptionist.objects.create(user=user, **validated_data)
                return receptionist
        except Exception as e:
            raise ValidationError(f"Error creating user or doctor: {e}")

class DoctorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)  # Handle username separately
    password = serializers.CharField(write_only=True)  # Hide password from responses
    class Meta:
        model = Doctor
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'department_id', 'phone', 'date_of_birth',
                  'address', 'sex', 'is_active', 'joining_date', 'salary']

    def create(self, validated_data):
        try:
            with transaction.atomic():
                # Extract username and password from validated data
                username = validated_data.pop('username')
                password = validated_data.pop('password')

                # Create a new User instance
                user = User.objects.create(username=username)
                user.set_password(password)  # Hash the password properly
                user.save()

                # Create and return the Doctor instance
                doctor = Doctor.objects.create(user=user, **validated_data)
                return doctor

        except KeyError as e:
            raise ValidationError(f"Missing required field: {e}")
        except Exception as e:
            raise ValidationError(f"Error creating doctor: {str(e)}")



