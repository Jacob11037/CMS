from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import Admin  # Ensure this is imported from the correct file


class AdminSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Admin
        fields = [
            'id', 'user', 'staff_id', 'first_name', 'last_name', 
            'email', 'phone', 'date_of_birth', 'is_active', 
            'joining_date', 'address', 'salary', 'sex'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        admin = Admin.objects.create(user=user_data, **validated_data)
        return admin

    def update(self, instance, validated_data):
        instance.user = validated_data.get('user', instance.user)
        instance.staff_id = validated_data.get('staff_id', instance.staff_id)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.date_of_birth = validated_data.get('date_of_birth', instance.date_of_birth)
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.joining_date = validated_data.get('joining_date', instance.joining_date)
        instance.address = validated_data.get('address', instance.address)
        instance.salary = validated_data.get('salary', instance.salary)
        instance.sex = validated_data.get('sex', instance.sex)
        instance.save()
        return instance
