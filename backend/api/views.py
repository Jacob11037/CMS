from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Appointment, Patient
from .serializers import AppointmentSerializer, PatientSerializer
from rest_framework.pagination import PageNumberPagination



# Create your views here.

@api_view(['POST'])
def register_patient(request):
    patient = PatientSerializer(data=request.data)
    if patient.is_valid():
        patient.save()
        return Response({'message':'Patient Successfully Registered'}, status=status.HTTP_201_CREATED)
    return Response(patient.errors, status=status.HTTP_400_BAD_REQUEST)

class PatientPagination(PageNumberPagination):
    page_size = 4

@api_view(['GET'])
def patient_list(request):
    date = request.GET.get('date_of_birth', None)

    patients = Patient.objects.all()

    if date:
        patients = patients.filter(date_of_birth = date)

    paginator = PatientPagination()
    result_page = paginator.paginate_queryset(patients, request)
    serializer = PatientSerializer(result_page, many=True)

    return paginator.get_paginated_response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
def patient_detail(request, pk):
    try:
        patient = Patient.objects.get(pk=pk)
    except Patient.DoesNotExist:
        return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = PatientSerializer(patient, data =request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        patient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def register_appointment(request):
    serializer = AppointmentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AppointmentPagination(PageNumberPagination):
    page_size = 2  # Adjust the page size

@api_view(['GET'])
def list_appointments(request):
    doctor_name = request.GET.get('doctor_name', None)
    appointment_date = request.GET.get('appointment_date', None)
    appt_status = request.GET.get('status', None)

    appointments = Appointment.objects.all()

    if doctor_name:
        appointments = appointments.filter(doctor_name__icontains=doctor_name)

    if appointment_date:
        appointments = appointments.filter(appointment_date__date=appointment_date)

    if appt_status:
        appointments = appointments.filter(status=appt_status)

    paginator = AppointmentPagination()
    result_page = paginator.paginate_queryset(appointments, request)
    serializer = AppointmentSerializer(result_page, many=True)

    return paginator.get_paginated_response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
def appointment_detail(request, pk):
    try:
        appointment = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response({"error": "Appointment not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = AppointmentSerializer(appointment)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = AppointmentSerializer(appointment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        appointment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


