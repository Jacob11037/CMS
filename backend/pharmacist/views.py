from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Medicine
from .serializers import MedicineSerializer

class MedicineSearchView(APIView):
    def get(self, request):
        search_term = request.GET.get('search', '')
        medicines = Medicine.objects.filter(medicine_name__icontains=search_term)  # Corrected field name
        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)

class MedicineStockUpdateView(APIView):
    def patch(self, request, pk):
        try:
            medicine = Medicine.objects.get(pk=pk)
            stock_to_add = request.data.get('stock', 0)
            medicine.stock += stock_to_add
            medicine.save()
            return Response({"message": "Stock updated successfully!"}, status=status.HTTP_200_OK)
        except Medicine.DoesNotExist:
            return Response({"error": "Medicine not found!"}, status=status.HTTP_404_NOT_FOUND)

class MedicineUpdateView(APIView):
    def patch(self, request, pk):
        try:
            medicine = Medicine.objects.get(pk=pk)
            medicine.medicine_name = request.data.get('medicine_name', medicine.medicine_name)
            medicine.manufacturer = request.data.get('manufacturer', medicine.manufacturer)
            medicine.save()
            return Response({"message": "Medicine updated successfully!"}, status=status.HTTP_200_OK)
        except Medicine.DoesNotExist:
            return Response({"error": "Medicine not found!"}, status=status.HTTP_404_NOT_FOUND)

class MedicineDeleteView(APIView):
    def delete(self, request, pk):
        try:
            medicine = Medicine.objects.get(pk=pk)
            medicine.delete()
            return Response({"message": "Medicine deleted successfully!"}, status=status.HTTP_204_NO_CONTENT)
        except Medicine.DoesNotExist:
            return Response({"error": "Medicine not found!"}, status=status.HTTP_404_NOT_FOUND)
