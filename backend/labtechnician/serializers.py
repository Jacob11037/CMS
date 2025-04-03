class LabTechnicianSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTechnician
        fields = ['user', 'staff_id' ,'first_name', 'last_name','email','date_of_birth', 'is_active', 'joining_date','address','salary']



from rest_framework import serializers
from .models import LabReport, LabReportTestResult, PrescriptionLabTest

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
            'created_at', 'generated_by', 'report_pdf', 'test_results'
        ]
        read_only_fields = ['id', 'requested_by', 'created_at', 'report_pdf']

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

class GenerateLabReportView(generics.CreateAPIView):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer  # Uses the new serializer

    def perform_create(self, serializer):
        # Auto-set 'requested_by' to the prescribing doctor
        prescription = serializer.validated_data['prescription']
        serializer.save(requested_by=prescription.doctor.staff_id)
        
        # PDF generation (call your PDF utility here)
        lab_report = serializer.instance
        pdf_path = generate_pdf_for_lab_report(lab_report)  # Implement this
        lab_report.report_pdf = pdf_path
        lab_report.save()


from rest_framework import serializers
from .models import LabTest, LabTestPrescription

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'
        read_only_fields = ('created_at',)

class LabTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTestPrescription
        fields = ['id', 'test', 'result_data', 'status', 'remarks']
        extra_kwargs = {
            'test': {'read_only': True},  # Prevent test ID changes
            'status': {'read_only': True}  # Updated automatically
        }

class LabTestPrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTestPrescription
        fields = '__all__'