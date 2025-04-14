from django_filters import rest_framework as filters
from api.models import Appointment


class AppointmentFilter(filters.FilterSet):
    doctor_name = filters.CharFilter(field_name='doctor__first_name', lookup_expr='icontains')
    patient_name = filters.CharFilter(field_name='patient__first_name', lookup_expr='icontains')
    start_time = filters.DateFilter(field_name='start_time__date')

    class Meta:
        model = Appointment
        fields = {
            'status': ['exact'],
            'start_time': ['exact'],
        }
