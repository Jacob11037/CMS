# clinic/serializers.py

from rest_framework import serializers
from api.models import Receptionist, Department, Doctor, Pharmacist, LabTechnician
from django.contrib.auth.models import User

class ReceptionistSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Receptionist
        fields = [
            'id', 'username', 'password', 'staff_id', 'first_name', 'last_name',
            'email', 'phone', 'date_of_birth', 'is_active',
            'joining_date', 'address', 'salary', 'sex'
        ]
        read_only_fields = ['staff_id', 'joining_date']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=username, password=password)
        validated_data['user'] = user
        receptionist = Receptionist.objects.create(**validated_data)
        return receptionist

    def update(self, instance, validated_data):
        user = instance.user
        if 'username' in validated_data:
            user.username = validated_data.pop('username')
        if 'password' in validated_data:
            user.set_password(validated_data.pop('password'))
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance





from rest_framework import serializers
from api.models import Doctor

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ['staff_id', 'joining_date']

    def validate_sex(self, value):
        valid_choices = ['Male', 'Female', 'Other', None, '']
        if value not in valid_choices:
            raise serializers.ValidationError("Invalid sex choice.")
        return value

from rest_framework import serializers
from api.models import Pharmacist
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PharmacistSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Pharmacist
        fields = [
            'id', 'username', 'password', 'staff_id', 'first_name', 'last_name',
            'email', 'phone', 'date_of_birth', 'is_active',
            'joining_date', 'address', 'salary', 'sex', 'pharmacy_license'
        ]
        read_only_fields = ['staff_id', 'joining_date']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=username, password=password)
        validated_data['user'] = user
        pharmacist = Pharmacist.objects.create(**validated_data)
        return pharmacist

    def update(self, instance, validated_data):
        user = instance.user
        if 'username' in validated_data:
            user.username = validated_data.pop('username')
        if 'password' in validated_data:
            user.set_password(validated_data.pop('password'))
        user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


from django.contrib.auth.models import User
from rest_framework import serializers

class LabTechnicianSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = LabTechnician
        fields = [
            'id', 'username', 'password', 'staff_id', 'first_name', 'last_name',
            'email', 'phone', 'date_of_birth', 'is_active',
            'joining_date', 'address', 'salary', 'sex', 'lab_certification'
        ]
        read_only_fields = ['staff_id', 'joining_date']

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})

        user = User.objects.create_user(username=username, password=password)
        validated_data['user'] = user
        return LabTechnician.objects.create(**validated_data)



from rest_framework import serializers
from api.models import Admin

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = '__all__'
        read_only_fields = ['staff_id', 'joining_date']

    def validate_sex(self, value):
        if value not in ['Male', 'Female', 'Other', None, '']:
            raise serializers.ValidationError("Invalid sex choice.")
        return value






from rest_framework import serializers
from api.models import Medicine

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'







from rest_framework import serializers
from api.models import LabTest

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'




from rest_framework import serializers
from api.models import Department


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'department_name', 'fee']

    def validate_fee(self, value):
        if value < 0:
            raise serializers.ValidationError("Consultation fee must be a positive number.")
        return value
