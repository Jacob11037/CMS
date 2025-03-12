from rest_framework import permissions
from api.models import Doctor, Receptionist  # Import your Doctor model

class IsDoctor(permissions.BasePermission):
    """
    Custom permission to allow only users who are doctors.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Ensure the user is linked to a Doctor instance
        return Doctor.objects.filter(user=request.user).exists()

class IsReceptionist(permissions.BasePermission):
    """
    Custom permission to allow only users who are receptionists.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Ensure the user is linked to a Receptionist instance
        return Receptionist.objects.filter(user=request.user).exists()
