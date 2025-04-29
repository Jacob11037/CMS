from django.urls import path
from . import views
from .views import LoginView

urlpatterns = [
    path('medicine/add/', views.add_medicine, name='add_medicine'),
    path('medicine/<int:pk>/update/', views.update_medicine, name='update_medicine'),
    path('medicine/<int:pk>/delete/', views.delete_medicine, name='delete_medicine'),
    path('api-auth/', include('rest_framework.urls')),

    # Add other URLs as needed
]