from django.urls import path
from .views import register_patient

urlpatterns = [
    path('register-patient/', register_patient, name='register_patient'),
]
