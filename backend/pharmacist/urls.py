from django.urls import path
from .views import (
    MedicineSearchView,
    MedicineStockUpdateView,
    MedicineUpdateView,
    MedicineDeleteView
)

urlpatterns = [
    path('medicine/', MedicineSearchView.as_view(), name='medicine_search'),
    path('medicine/<int:pk>/update-stock/', MedicineStockUpdateView.as_view(), name='update_stock'),
    path('medicine/<int:pk>/update/', MedicineUpdateView.as_view(), name='update_medicine'),
    path('medicine/<int:pk>/delete/', MedicineDeleteView.as_view(), name='delete_medicine'),
]
