from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.serializers import PatientSerializer


# Create your views here.

@api_view(['POST'])
def register_patient(request):
    patient = PatientSerializer(data=request.data)
    if patient.is_valid():
        patient.save()
        return Response({'message':'Patient Successfully Registered'}, status=status.HTTP_201_CREATED)
    return Response(patient.errors, status=status.HTTP_400_BAD_REQUEST)



