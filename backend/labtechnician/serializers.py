from rest_framework import serializers
from .models import LabTechnician,LabReport,LabReportTestResult,LabTest
from api.models import PrescriptionLabTest


class LabTechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTechnician
        fields = ['user', 'staff_id' ,'first_name', 'last_name','email','date_of_birth', 'is_active', 'joining_date','address','salary']


class LabReportTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabReportTestResult
        fields = ['id', 'prescription_lab_test', 'result_data']
        read_only_fields = ['id']

    def validate_prescription_lab_test(self, value):
        """Ensure the test belongs to the prescription."""
        if value.status != 'Pending':
            raise serializers.ValidationError("This test is already completed.")
        return value


class LabReportSerializer(serializers.ModelSerializer):
    test_results = LabReportTestResultSerializer(many=True, write_only=True)  # For input only

    class Meta:
        model = LabReport
        fields = [
            'id', 'prescription', 'remarks', 'requested_by', 
            'generated_by', 'report_pdf', 'test_results'
        ]
        read_only_fields = ['id', 'requested_by',  'report_pdf']

    def create(self, validated_data):
        # Extract test_results data
        test_results_data = validated_data.pop('test_results')
        
        # Create LabReport
        lab_report = LabReport.objects.create(**validated_data)
        
        # Create LabReportTestResult entries
        for result_data in test_results_data:
            LabReportTestResult.objects.create(
                lab_report=lab_report,
                **result_data
            )
            # Update PrescriptionLabTest status
            result_data['prescription_lab_test'].status = 'Completed'
            result_data['prescription_lab_test'].save()
        
        return lab_report

# class PrescriptionLabTestSerializer(serializers.ModelSerializer):
#     lab_test_name = serializers.CharField(source='lab_test.test_name', read_only=True)
#     patient_name = serializers.CharField(source='prescription.patient.name', read_only=True)

#     class Meta:
#         model = PrescriptionLabTest
#         fields = [
#             'id', 'lab_test', 'lab_test_name', 'prescription', 
#             'patient_name', 'test_date', 'status'
#         ]

from rest_framework import serializers
from .models import PrescriptionLabTest

class PrescriptionLabTestSerializer(serializers.ModelSerializer):
    patient = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    test_name = serializers.CharField(source='lab_test.test_name', read_only=True)
    prescribed_date = serializers.DateField(source='test_date', read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = PrescriptionLabTest
        fields = ['id','patient', 'doctor', 'test_name', 'prescribed_date', 'status']

    def get_patient(self, obj):
        return f"{obj.prescription.patient.first_name} {obj.prescription.patient.last_name}"

    def get_doctor(self, obj):
        return f"{obj.prescription.doctor.first_name} {obj.prescription.doctor.last_name}"




class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class LabTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionLabTest
        fields = ['id', 'lab_test', 'status']
        extra_kwargs = {
            'lab_test': {'read_only': True},  # Fix typo: make lab_test readonly
            'status': {'required': False},     # Allow updating status from frontend
        }


# serializers.py
class PrescriptionLabTestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionLabTest
        fields = ['id','status','test_date','prescription','lab_test']
        extra_kwargs = {
            'test_date': {'required': False},
            'prescription': {'required': False},
            'lab_test': {'required': False},
        }

# class LabTestPrescriptionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PrescriptionLabTest
#         fields = '__all__'


# serializers.py

from rest_framework import serializers
from .models import Patient, Doctor

class PatientDropdownSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ['id', 'name']  # "name" will be the full name

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


class DoctorDropdownSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = ['id', 'name']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
