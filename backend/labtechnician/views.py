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
from api.models import PrescriptionLabTest,LabTest,Prescription
from django.utils import timezone
from django.http import FileResponse
from reportlab.pdfgen import canvas
from io import BytesIO
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PrescriptionLabTest
from .permissions import IsLabTechnician
from .serializers import PrescriptionLabTestSerializer





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
    serializer_class = LabReportSerializer
    permission_classes = [IsLabTechnician]

    def generate_pdf_report(self, lab_report):
        """Generate professional PDF report and return the file path"""
        try:
            buffer = BytesIO()
            p = canvas.Canvas(buffer)
            
            # Set font styles
            p.setFont("Helvetica-Bold", 16)
            p.drawCentredString(300, 800, "LABORATORY TEST REPORT")
            p.setFont("Helvetica", 12)
            
            # Patient Information
            patient = lab_report.prescription.patient
            p.drawString(50, 770, f"Patient Name: {patient.first_name} {patient.last_name}")
            p.drawString(50, 750, f"Date of Birth: {patient.date_of_birth}")
            p.drawString(50, 730, f"Blood Group: {patient.blood_group}")
            
            # Doctor Information
            doctor = lab_report.prescription.doctor
            p.drawString(50, 700, f"Referring Physician: Dr. {doctor.user.get_full_name()}")
            p.drawString(50, 680, f"Doctor ID: {doctor.staff_id}")
            
            # Report Metadata
            p.drawString(50, 650, f"Report ID: LR-{lab_report.id}")
            p.drawString(50, 630, f"Report Date: {lab_report.created_at.strftime('%Y-%m-%d %H:%M')}")
            if lab_report.generated_by:
                p.drawString(50, 610, f"Lab Technician: {lab_report.generated_by.user.get_full_name()}")
            
            # Test Results Header
            p.setFont("Helvetica-Bold", 14)
            p.drawString(50, 580, "TEST RESULTS")
            p.setFont("Helvetica", 12)
            p.line(50, 575, 550, 575)
            
            # Test Results Table
            y_position = 550
            for result in lab_report.labreporttestresult_set.all():
                test = result.prescription_lab_test.lab_test
                p.drawString(50, y_position, f"• {test.name}")
                p.drawString(300, y_position, f"Result: {result.result_data}")
                
                # Add reference range if available
                if hasattr(test, 'reference_range') and test.reference_range:
                    p.setFont("Helvetica-Oblique", 10)
                    p.drawString(50, y_position-20, f"Reference Range: {test.reference_range}")
                    p.setFont("Helvetica", 12)
                    y_position -= 25
                
                y_position -= 40
                
                # Add page break if running out of space
                if y_position < 100:
                    p.showPage()
                    y_position = 800
                    p.setFont("Helvetica", 12)
            
            # Footer
            p.setFont("Helvetica-Oblique", 10)
            p.drawString(50, 50, "This report was generated electronically and requires authorized signature")
            p.drawString(50, 35, f"© {settings.HOSPITAL_NAME} - All rights reserved")
            
            p.showPage()
            p.save()
            
            # Save PDF to media directory
            media_root = settings.MEDIA_ROOT
            os.makedirs(os.path.join(media_root, 'lab_reports'), exist_ok=True)
            file_path = os.path.join(media_root, 'lab_reports', f'report_{lab_report.id}.pdf')
            
            with open(file_path, 'wb') as f:
                f.write(buffer.getvalue())
            
            return f'lab_reports/report_{lab_report.id}.pdf'

        except Exception as e:
            print(f"PDF Generation Error: {str(e)}")
            raise

    def create(self, request, *args, **kwargs):
        prescription_id = request.data.get('prescription_id')
        test_results = request.data.get('test_results')
        generated_by_id = request.data.get('generated_by')  # Note: Typo here should be 'generated_by'
        
        try:
            # Validate technician exists
            technician = LabTechnician.objects.get(id=generated_by_id)
            
            prescription = Prescription.objects.get(id=prescription_id)
            lab_report = LabReport.objects.create(
                prescription=prescription,
                requested_by=prescription.doctor.staff_id,
                generated_by=technician
            )

            # Process test results
            for result in test_results:
                prescription_lab_test = PrescriptionLabTest.objects.get(
                    id=result['prescription_lab_test_id']
                )
                LabReportTestResult.objects.create(
                    lab_report=lab_report,
                    prescription_lab_test=prescription_lab_test,
                    result_data=result['result_data']
                )
                prescription_lab_test.status = 'Completed'
                prescription_lab_test.save()

            # Generate and attach PDF
            pdf_path = self.generate_pdf_report(lab_report)
            lab_report.report_pdf = pdf_path
            lab_report.save()

            return Response(
                LabReportSerializer(lab_report).data, 
                status=status.HTTP_201_CREATED
            )
            
        except Prescription.DoesNotExist:
            return Response(
                {"error": "Prescription not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except LabTechnician.DoesNotExist:
            return Response(
                {"error": "Lab technician not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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
    
    

    def get(self, request):
        pending_tests = PrescriptionLabTest.objects.filter(status='Pending').count()
        print(request.user)
        completed_today = LabReport.objects.filter(
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
        # serializer.save(status='Completed')  # Auto-update status
        return Response(serializer.data)


# views.py
from rest_framework import generics
from .models import PrescriptionLabTest
from .serializers import PrescriptionLabTestUpdateSerializer
from .permissions import IsLabTechnician

class LabTestResultDetailView(generics.UpdateAPIView):
    queryset = PrescriptionLabTest.objects.all()
    serializer_class = PrescriptionLabTestUpdateSerializer
    permission_classes = [IsLabTechnician]
    http_method_names = ['get', 'patch', 'put'] 



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

from django.http import FileResponse, Http404
import os

class LabReportDownloadView(APIView):
    permission_classes = [IsLabTechnician]

    def get(self, request, report_id):
        try:
            report = LabReport.objects.get(id=report_id)

            if not report.report_pdf:
                return Response({'error': 'Report PDF not found'}, status=404)

            file_path = os.path.join(settings.MEDIA_ROOT, report.report_pdf)
            if not os.path.exists(file_path):
                return Response({'error': 'PDF file not found on server'}, status=404)

            return FileResponse(open(file_path, 'rb'), content_type='application/pdf')

        except LabReport.DoesNotExist:
            return Response({'error': 'Report not found'}, status=404)

# lab/views.py

class PrescriptionLabTestListAPIView(generics.ListAPIView):
    queryset = PrescriptionLabTest.objects.select_related(
        'prescription__patient',
        'prescription__doctor',
        'lab_test'
    ).all()
    serializer_class = PrescriptionLabTestSerializer



class PrescriptionLabTestViewSet(viewsets.ModelViewSet):
    queryset = PrescriptionLabTest.objects.all()
    serializer_class = PrescriptionLabTestSerializer
    permission_classes = [IsLabTechnician]

    # @action(detail=True, methods=['patch'], url_path='cancel')
    # def cancel_lab_test(self, request, pk=None):
    #     lab_test = self.get_object()
    #     lab_test.status = 'Cancelled'
    #     lab_test.save()
    #     return Response({"message": "Lab Test cancelled successfully."}, status=status.HTTP_200_OK)
