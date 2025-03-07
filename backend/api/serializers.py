# api/serializers.py
from rest_framework import serializers
from .models import Patient

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
