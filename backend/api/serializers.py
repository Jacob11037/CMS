# api/serializers.py
from datetime import datetime
from warnings import catch_warnings

from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Patient, Appointment, PrescriptionLabTest, PrescriptionMedicine, Prescription, ConsultationBill, \
    PrescriptionBill, Doctor, Receptionist, Department, MedicalHistory, Medicine, LabTest


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
        """Ensure no overlapping appointments for the same doctor on the same date."""
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError("End time must be after start time.")

        overlapping_appointments = Appointment.objects.filter(
            doctor=data['doctor'],  # This now uses staff_id
            start_time__date=data['start_time'].date(),  # Check if the date is the same
            end_time__gte=data['start_time'],  # Check if the existing appointment overlaps with the new one
            start_time__lte=data['end_time']  # Check if the new appointment overlaps with the existing one
        )

        # Exclude the instance when updating (if applicable)
        if self.instance:
            overlapping_appointments = overlapping_appointments.exclude(id=self.instance.id)

        if overlapping_appointments.exists():
            raise serializers.ValidationError("This time slot is already booked on the selected date. Please choose another time.")

        return data


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.medicine_name')  # Include medicine name
    medicine_id = serializers.PrimaryKeyRelatedField(source='medicine', read_only=True)  # Include medicine ID

    class Meta:
        model = PrescriptionMedicine
        fields = ['medicine_id', 'medicine_name', 'dosage', 'frequency']  # Include dosage and frequency

class PrescriptionLabTestSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(source='lab_test.test_name')  # Include lab test name
    test_id = serializers.PrimaryKeyRelatedField(source='lab_test', read_only=True)  # Include lab test ID

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
        fields = ['id', 'patient', 'diagnosis', 'medical_notes', 'prescription']  # Include prescription field




class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class PrescriptionBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionBill
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
    username = serializers.CharField(source='user.username')  # Reference `User` model
    password = serializers.CharField(source='user.password', write_only=True)

    class Meta:
        model = Receptionist
        fields = ['username', 'password', 'email', 'first_name', 'last_name', 'phone']

    def create(self, validated_data):
        try:
            with transaction.atomic():  # Start a database transaction

                user_data = validated_data.pop('user')

                user = User.objects.create_user(
                    username=user_data['username'],
                    password=user_data['password'],
                )
                receptionist = Receptionist.objects.create(user=user, **validated_data)
                return receptionist
        except Exception as e:
            raise ValidationError(f"Error creating user or doctor: {e}")

class DoctorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)  # Handle username separately
    password = serializers.CharField(write_only=True)  # Hide password from responses
    class Meta:
        model = Doctor
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'department_id', 'phone']

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



