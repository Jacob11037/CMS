from django.urls import path
from .views import register_patient, patient_list, patient_detail, register_appointment, list_appointments, \
    appointment_detail

urlpatterns = [
    path('register-patient/', register_patient, name='register_patient'),
    path('patients/', patient_list, name='patient_list'),
    path('patients/<int:pk>/', patient_detail, name='patient_detail'),

    path('register-appointment/', register_appointment, name='register_appointment'),
    path('appointments/', list_appointments, name='list_appointments'),
    path('appointments/<int:pk>/', appointment_detail, name='appointment_detail'),
]
