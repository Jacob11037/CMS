from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from .models import (
    Role, User_Details, Staff, Department, Doctor, Patient, Appointment,
    Appointment_Billing, Token, Medicine, Medicine_Stock, Lab_Test, Consultation,
    Pharmacist_Billing, LabTech_Bill, Patient_History
)

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserDetailsSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    role = RoleSerializer()

    class Meta:
        model = User_Details
        fields = '__all__'

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

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


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient = PatientSerializer()
    doctor = DoctorSerializer()
    
    class Meta:
        model = Appointment
        fields = '__all__'

class AppointmentBillingSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer()
    
    class Meta:
        model = Appointment_Billing
        fields = '__all__'

class TokenSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer()
    
    class Meta:
        model = Token
        fields = '__all__'

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class MedicineStockSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer()
    
    class Meta:
        model = Medicine_Stock
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lab_Test
        fields = '__all__'

class ConsultationSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer()
    lab_test = LabTestSerializer()
    medicine = MedicineSerializer()
    token = TokenSerializer()
    
    class Meta:
        model = Consultation
        fields = '__all__'

class PharmacistBillingSerializer(serializers.ModelSerializer):
    consultation = ConsultationSerializer()
    medicine = MedicineSerializer()
    
    class Meta:
        model = Pharmacist_Billing
        fields = '__all__'

class LabTechBillSerializer(serializers.ModelSerializer):
    consultation = ConsultationSerializer()
    lab_test = LabTestSerializer()
    
    class Meta:
        model = LabTech_Bill
        fields = '__all__'

class PatientHistorySerializer(serializers.ModelSerializer):
    consultation = ConsultationSerializer()
    pharmacist_bill = PharmacistBillingSerializer()
    lab_tech_bill = LabTechBillSerializer()
    
    class Meta:
        model = Patient_History
        fields = '__all__'
