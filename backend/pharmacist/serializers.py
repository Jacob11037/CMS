from rest_framework import serializers
from .models import Medicine

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class MedicineStockUpdateSerializer(serializers.Serializer):
    medicine_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True)

    def validate_quantity(self, value):
        if value == 0:
            raise serializers.ValidationError("Quantity cannot be zero")
        return value
