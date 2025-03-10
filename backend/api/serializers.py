# api/serializers.py
from datetime import datetime

from rest_framework import serializers
from .models import Patient, Appointment


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
