# api/serializers.py
from datetime import datetime
from warnings import catch_warnings

from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Patient, Appointment, PrescriptionLabTest, PrescriptionMedicine, Prescription, ConsultationBill, \
    PrescriptionBill, Doctor, Receptionist, Department


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['first_name', 'last_name', 'date_of_birth', 'phone', 'email', 'address']

    def validate_phone(self, value):
        """
        Custom validation for phone number format.
        """
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Invalid phone number format.")
        return value


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

    def validate_appointment_date(self, value):
        if value < datetime.now():
            raise serializers.ValidationError("Appointment date cannot be in the past.")
        return value

    def validate_status(self, value):
        allowed_statuses = ['Pending', 'Completed', 'Cancelled']
        if value not in allowed_statuses:
            raise serializers.ValidationError("Invalid status.")
        return value


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name')

    class Meta:
        model = PrescriptionMedicine
        fields = ['medicine_name', 'dosage', 'frequency']


class PrescriptionLabTestSerializer(serializers.ModelSerializer):
    lab_test_name = serializers.CharField(source='lab_test.name')

    class Meta:
        model = PrescriptionLabTest
        fields = ['lab_test_name', 'test_date']


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.first_name')
    doctor_name = serializers.CharField(source='doctor.first_name')
    medicines = PrescriptionMedicineSerializer(source='prescriptionmedicine_set', many=True)
    lab_tests = PrescriptionLabTestSerializer(source='prescriptionlabtest_set', many=True)

    class Meta:
        model = Prescription
        fields = ['id', 'patient_name', 'doctor_name', 'appointment', 'notes', 'medicines', 'lab_tests']


class PrescriptionBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionBill
        fields = ['id', 'prescription', 'patient', 'amount', 'bill_date', 'paid']

class ConsultationBillSerializer(serializers.ModelSerializer):  # Renamed from AppointmentBillSerializer
    class Meta:
        model = ConsultationBill
        fields = ['id', 'appointment', 'patient', 'amount', 'bill_date', 'paid']

class DoctorViewSerializer(serializers.ModelSerializer):
    # username = serializers.CharField(source='user.username', read_only=True)
    # password = serializers.CharField(source='user.password', read_only=True)

    class Meta:
        model = Doctor
        fields = ['id','email', 'first_name', 'last_name', 'department_id', 'phone']

class ReceptionistViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receptionist
        fields = ['first_name', 'last_name', 'email', 'phone']  # Add any other fields you need


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
    username = serializers.CharField(source='user.username')  # Reference `User` model
    password = serializers.CharField(source='user.password', write_only=True)

    class Meta:
        model = Doctor
        fields = ['username', 'password', 'email','first_name', 'last_name', 'department_id', 'phone']

    def create(self, validated_data):
        # Extract user-related data
        try:
            with transaction.atomic():  # Start a database transaction
                user_data = validated_data.pop('user')

                user = User.objects.create_user(
                username=user_data['username'],
                password=user_data['password']
                )
                # Create Doctor instance
                doctor = Doctor.objects.create(user=user, ** validated_data)
                return doctor
        except Exception as e:
            raise ValidationError(f"Error creating user or doctor: {e}")


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['department_name']