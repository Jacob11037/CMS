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

class PrescriptionLabTestSerializer(serializers.ModelSerializer):
    lab_test_name = serializers.CharField(source='lab_test.test_name', read_only=True)
    patient_name = serializers.CharField(source='prescription.patient.name', read_only=True)

    class Meta:
        model = PrescriptionLabTest
        fields = [
            'id', 'lab_test', 'lab_test_name', 'prescription', 
            'patient_name', 'test_date', 'status'
        ]





class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'

class LabTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionLabTest
        fields = ['id', 'test', 'result_data', 'status', 'remarks']
        extra_kwargs = {
            'test': {'read_only': True},  # Prevent test ID changes
            'status': {'read_only': True}  # Updated automatically
        }

class LabTestPrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescriptionLabTest
        fields = '__all__'