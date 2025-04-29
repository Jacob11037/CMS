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
        path('', include('api.urls')),  # Core API endpoints like doctors/patients

        # Pharmacist-specific endpoints
        path('pharmacist/', include('pharmacist.urls')),
    ])),

    # Default route
    path('', home),
]
