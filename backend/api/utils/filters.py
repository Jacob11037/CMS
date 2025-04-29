from django_filters import rest_framework as filters
from api.models import Appointment, Bill


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


class BillFilter(filters.FilterSet):
    # Partial match for phone number (contains)
    phone_number = filters.CharFilter(field_name='phone_number', lookup_expr='icontains')

    # Partial match for patient name
    name = filters.CharFilter(field_name='name', lookup_expr='icontains')

    # Date filter (exact date or date range)
    bill_date = filters.DateFilter(field_name='bill_date', lookup_expr='date')
    # bill_date_after = filters.DateFilter(field_name='bill_date', lookup_expr='date__gte')
    # bill_date_before = filters.DateFilter(field_name='bill_date', lookup_expr='date__lte')

    class Meta:
        model = Bill
        fields = ['paid', 'bill_type']
