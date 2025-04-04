from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to allow only admin users.
    """

    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.groups.filter(name="Admin").exists()
