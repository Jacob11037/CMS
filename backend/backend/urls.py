"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include, re_path


def home(request):
    return JsonResponse({"message": "Welcome to the clinic management API!"})


urlpatterns = [
    path('admin/', admin.site.urls),
    # Auth
    path('auth/', include('djoser.urls.jwt')),  # /api/auth/token/
    path('auth/', include('djoser.urls')),  # /api/auth/token/
    path('api/', include([
        # Main app endpoints directly under /api/
        path('', include('api.urls')),  # /api/doctors/, /api/patients/

        # New apps with subpaths
        # path('labtechnician/', include('labtechnician.urls')),  # /api/medical/
        # path('pharmacist/', include('pharmacist.urls')),  # /api/pharmacist/
        # path('admin/', include('Admin.urls')),  # /api/admin/



    ])),
    path('', home),

]

