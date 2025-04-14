from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math

class LimitTenPagination(PageNumberPagination):
    page_size = 10  # default items per page
    page_size_query_param = 'page_size'  # allows client to override with ?page_size=

    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page_size)
        return Response({
            'count': self.page.paginator.count,
            'total_pages': total_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
