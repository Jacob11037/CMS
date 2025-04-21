# Create your views here.

from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response
from .models import LabTechnician, LabReport
from .serializers import LabTechnicianSerializer, LabReportSerializer, PrescriptionLabTestSerializer,LabTestSerializer,LabTestResultSerializer
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
from django.conf import settings
from .permissions import IsLabTechnician
from .permissions import IsDoctorOrLabTechnician
from rest_framework.views import APIView
from .permissions import IsDoctor
from api.models import PrescriptionLabTest,LabTest
from django.utils import timezone



# View Pending Lab Tests
class PendingLabTestsView(generics.ListAPIView):
    serializer_class = PrescriptionLabTestSerializer

    def get_queryset(self):
        queryset = PrescriptionLabTest.objects.all()  # Your original queryset
        print(queryset.query)  # Prints the raw SQL query
        return queryset

# Generate Lab Report (Submit Results + PDF)
class GenerateLabReportView(generics.CreateAPIView):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer  # You'll need to create this
    permission_classes = [IsLabTechnician]  # Only lab techs

    def create(self, request, *args, **kwargs):
        prescription_id = request.data.get('prescription_id')
        test_results = request.data.get('test_results')  # List of {prescription_lab_test_id, result_data}
        generated_by_id = request.data.get('generated_by')
        
        print(request.data)
        try:
            prescription = Prescription.objects.get(id=prescription_id)
            lab_report = LabReport.objects.create(
                prescription=prescription,
                requested_by=prescription.doctor.staff_id,
                generated_by_id=generated_by_id
            )

            # Save individual test results
            for result in test_results:
                prescription_lab_test = PrescriptionLabTest.objects.get(id=result['prescription_lab_test_id'])
                LabReportTestResult.objects.create(
                    lab_report=lab_report,
                    prescription_lab_test=prescription_lab_test,
                    result_data=result['result_data']
                )
                prescription_lab_test.status = 'Completed'
                prescription_lab_test.save()

            # Generate PDF (loop through LabReportTestResult)
            pdf_path = self.generate_pdf_report(lab_report)
            lab_report.report_pdf = pdf_path
            lab_report.save()

            return Response(LabReportSerializer(lab_report).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PendingPrescriptionLabTestsView(generics.ListAPIView):
    serializer_class = PrescriptionLabTestSerializer
    permission_classes = [IsDoctorOrLabTechnician]

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='LabTechnician').exists():
            return PrescriptionLabTest.objects.filter(status='Pending')
        elif user.groups.filter(name='Doctors').exists():
            return PrescriptionLabTest.objects.filter(
                status='Pending',
                prescription__doctor__user=user  # Assumes Doctor model links to User
            )
        return PrescriptionLabTest.objects.none()


class LabTechnicianDashboardView(APIView):
    permission_classes = [IsLabTechnician]
    
    # def get(self, request):
    #     if not hasattr(request.user, 'labtechnician'):
    #         return Response({"error": "Lab technician profile missing"}, status=400)

    def get(self, request):
        pending_tests = PrescriptionLabTest.objects.filter(status='Pending').count()
        print(request.user)
        completed_today = LabReport.objects.filter(
            # generated_by=request.user,
            # created_at__date=timezone.now().date()
        ).count()
        
        return Response({
            'pending_tests': pending_tests,
            'completed_today': completed_today
        })


class LabReportListByPrescriptionView(generics.ListAPIView):
    serializer_class = LabReportSerializer
    permission_classes = [IsDoctor]
    
    def get_queryset(self):
        prescription_id = self.kwargs['prescription_id']
        return LabReport.objects.filter(
            prescription_id=prescription_id,
            prescription__doctor__user=self.request.user
        )





from rest_framework import generics, status
from rest_framework.response import Response
from django_filters import rest_framework as filters

from .permissions import IsLabTechnician, IsDoctorOrLabTechnician

# # 4.1 Lab Test Prescription Management
class LabTestResultDetailView(generics.UpdateAPIView):
    queryset = PrescriptionLabTest.objects.all()
    serializer_class = LabTestResultSerializer
    permission_classes = [IsLabTechnician]
    http_method_names = ['put']  # Only allow PUT

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status='Completed')  # Auto-update status
        return Response(serializer.data)

class AppointmentLabTestResultsView(generics.ListAPIView):
    serializer_class = LabTestResultSerializer
    permission_classes = [IsDoctorOrLabTechnician]

    def get_queryset(self):
        appointment_id = self.kwargs['appointment_id']
        return PrescriptionLabTest.objects.filter(
            prescription__appointment_id=appointment_id
        )



# # 4.2 Lab Test Management
class LabTestListView(generics.ListCreateAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [IsDoctorOrLabTechnician]
    

class LabTestDetailView(generics.RetrieveUpdateAPIView):
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    permission_classes = [IsDoctorOrLabTechnician]
    

class PrescriptionLabTestFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name='created_at', lookup_expr='gte')
    end_date = filters.DateFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = PrescriptionLabTest
        fields = []

class LabTestResultsByDateView(generics.ListAPIView):
    serializer_class = LabTestResultSerializer
    permission_classes = [IsLabTechnician]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = PrescriptionLabTestFilter
    
    def get_queryset(self):
        return PrescriptionLabTest.objects.all()



