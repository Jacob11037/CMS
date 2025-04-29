from rest_framework import serializers
from .models import Pharmacist  # Adjust the import based on your app structure
from rest_framework import serializers
from django.contrib.auth.models import User

class PharmacistSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Pharmacist
        fields = ['user', 'staff_id', 'phone', 'date_of_birth', 'is_active', 'joining_date', 'address', 'salary', 'sex', 'pharmacy_license']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        pharmacist = Pharmacist.objects.create(user=user, **validated_data)
        return pharmacist

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user')
        instance.user.username = user_data.get('username', instance.user.username)
        instance.user.email = user_data.get('email', instance.user.email)
        instance.user.first_name = user_data.get('first_name', instance.user.first_name)
        instance.user.last_name = user_data.get('last_name', instance.user.last_name)
        instance.user.save()

        instance.staff_id = validated_data.get('staff_id', instance.staff_id)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.joining_date = validated_data.get('joining_date', instance.joining_date)
        instance.address = validated_data.get('address', instance.address)
        instance.salary = validated_data.get('salary', instance.salary)
        instance.sex = validated_data.get('sex', instance.sex)
        instance.pharmacy_license = validated_data.get('pharmacy_license', instance.pharmacy_license)
        instance.save()
        return instance
  
class LoginSerializer(serializers.Serializer):
      username = serializers.CharField()
      password = serializers.CharField()