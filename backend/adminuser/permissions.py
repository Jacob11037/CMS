from rest_framework import permissions

# Admin Permissions
class IsAdmin(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


# Pharmacist Permissions
class IsPharmacist(permissions.BasePermission):
    """
    Allows access only to pharmacists.
    """
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'pharmacist')


# Doctor Permissions
class IsDoctor(permissions.BasePermission):
    """
    Allows access only to doctors.
    """
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'doctor')


# Receptionist Permissions
class IsReceptionist(permissions.BasePermission):
    """
    Allows access only to receptionists.
    """
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'receptionist')


# Lab Technician Permissions
class IsLabTechnician(permissions.BasePermission):
    """
    Allows access only to lab technicians.
    """
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'labtechnician')


# General Read-Only Permissions for All Users
class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Allows read-only access to unauthenticated users, write access to authenticated users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_superuser:
            self.message = "Superuser access required."
        return request.user.is_superuser
