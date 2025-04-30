# api/serializers.py
from datetime import datetime
from warnings import catch_warnings

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import Appointment, PrescriptionLabTest, PrescriptionMedicine, Prescription, ConsultationBill, \
    Bill, Doctor, Receptionist, Department, MedicalHistory, Medicine, LabTest, Patient, MedicineBillItem, \
    LabTestBillItem


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
        slug_field='staff_id',
        queryset=Doctor.objects.all()
    )

    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'doctor_name', 'patient', 'patient_name', 'start_time', 'end_time', 'status']

    def get_patient_name(self, obj):
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

        # Business Hours Validation (10 AM to 5 PM)
        start_hour = start_time.time().hour
        end_hour = end_time.time().hour

        if start_hour < 10 or end_hour > 17:
            raise serializers.ValidationError("Appointments can only be booked between 10 AM and 5 PM.")

        if start_time.weekday() >= 5:  # 5 = Saturday, 6 = Sunday
            raise serializers.ValidationError("Appointments can only be booked on weekdays.")

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

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer()

    class Meta:
        model = PrescriptionMedicine
        fields = ['medicine', 'dosage', 'frequency', 'duration']

class PrescriptionLabTestSerializer(serializers.ModelSerializer):
    lab_test = LabTestSerializer()

    class Meta:
        model = PrescriptionLabTest
        fields = ['lab_test', 'test_date']

class PrescriptionSerializer(serializers.ModelSerializer):
    medicines = PrescriptionMedicineSerializer(source='prescriptionmedicine_set', many=True)
    lab_tests = PrescriptionLabTestSerializer(source='prescriptionlabtest_set', many=True)

    class Meta:
        model = Prescription
        fields = ['id', 'patient', 'doctor', 'appointment', 'notes', 'medicines', 'lab_tests']


class MedicalHistorySerializer(serializers.ModelSerializer):
    patient = PatientSerializer()  # optional, but helpful if you want full patient info
    prescription = PrescriptionSerializer()
    date_of_occurrence = serializers.DateField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = MedicalHistory
        fields = ['id', 'patient', 'diagnosis', 'prescription', 'date_of_occurrence']
        read_only_fields = ['date_of_occurrence']




class MedicineBillItemSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer()

    class Meta:
        model = MedicineBillItem
        fields = ['id', 'medicine', 'quantity']

class LabTestBillItemSerializer(serializers.ModelSerializer):
    lab_test = LabTestSerializer()

    class Meta:
        model = LabTestBillItem
        fields = ['id', 'lab_test']

class BillSerializer(serializers.ModelSerializer):
    medicines = MedicineBillItemSerializer(many=True, read_only=True)
    lab_tests = LabTestBillItemSerializer(many=True, read_only=True)

    class Meta:
        model = Bill
        fields = [
            'id', 'name', 'phone_number',
            'bill_type', 'bill_date', 'paid', 'total_amount',
            'medicines', 'lab_tests'
        ]



class MedicineBillItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineBillItem
        fields = ['medicine', 'quantity']

class LabTestBillItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTestBillItem
        fields = ['lab_test']

class BillCreateSerializer(serializers.ModelSerializer):
    medicines = MedicineBillItemCreateSerializer(many=True, required=False)
    lab_tests = LabTestBillItemCreateSerializer(many=True, required=False)

    class Meta:
        model = Bill
        fields = [
            'name', 'phone_number',
            'bill_type', 'paid', 'total_amount',
            'medicines', 'lab_tests'
        ]


    def create(self, validated_data):
        print(validated_data)
        medicines_data = validated_data.pop('medicines', [])
        lab_tests_data = validated_data.pop('lab_tests', [])
        bill = Bill.objects.create(**validated_data)

        for med in medicines_data:
            MedicineBillItem.objects.create(bill=bill, **med)
        for test in lab_tests_data:
            LabTestBillItem.objects.create(bill=bill, **test)

        return bill

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
    consultation_fee = serializers.DecimalField(source='department_id.fee', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Doctor
        fields = ['staff_id', 'first_name', 'last_name', 'department_id',  'email', 'phone', 'department_name','consultation_fee']

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
    department_name = serializers.CharField(source='department_id.department_name', read_only=True)
    consultation_fee = serializers.CharField(source='department_id.consultation_fee', read_only=True)


    class Meta:
        model = Doctor
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'department_id', 'phone', 'date_of_birth',
                  'address', 'sex', 'is_active', 'joining_date', 'salary', 'department_name','consultation_fee']

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



