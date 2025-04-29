from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include

def home(request):
    return JsonResponse({"message": "Welcome to the clinic management API!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth (use JWT authentication)
    path('auth/', include('djoser.urls.jwt')),  # Use JWT auth for token-based authentication

    # API endpoints, routes to specific apps like 'api' (e.g. doctors, patients, etc.)
    path('api/', include([
        # Main app endpoints directly under /api/
        path('', include('api.urls')),  # /api/doctors/, /api/patients/
        path('admin/', include('ADMIN.urls')), 
        
        # New apps with subpaths

        path('labtechnician/', include('labtechnician.urls')),  # /api/medical/
        path('pharmacist/', include('pharmacist.urls')),  # /api/pharmacist/
    ])),
    path('auth/', include('djoser.urls.jwt')),  # /api/auth/token/

    path('', home),
]
