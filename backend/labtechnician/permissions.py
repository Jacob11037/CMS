from rest_framework import permissions
from django.contrib.auth.models import Group

class IsLabTechnician(permissions.BasePermission):
    """Allow only users in the 'LabTechnicians' group."""
    message = "Only lab technicians can perform this action."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='LabTechnicians').exists()


class IsDoctor(permissions.BasePermission):
    """Allow only users in the 'Doctors' group."""
    message = "Only doctors can perform this action."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='Doctors').exists()


class IsDoctorOrLabTechnician(permissions.BasePermission):
    """Allow users in 'Doctors' or 'LabTechnicians' groups."""
    message = "Only doctors or lab technicians can perform this action."

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name__in=['Doctors', 'LabTechnicians']).exists()


class IsReportRequesterOrLabTechnician(permissions.BasePermission):
    """
    Allow:
    - Lab technicians (full access).
    - Doctors who requested the report (object-level permission).
    """
    message = "Only the requesting doctor or lab technicians can access this report."

    def has_permission(self, request, view):
        # Allow only doctors/lab techs at the view level
        return IsDoctorOrLabTechnician().has_permission(request, view)

    def has_object_permission(self, request, view, obj):
        # Lab technicians have full access
        if request.user.groups.filter(name='LabTechnicians').exists():
            return True
        
        # Doctors can access only their requested reports
        if request.user.groups.filter(name='Doctors').exists():
            return obj.requested_by == request.user.doctor.staff_id  # Adjust field as needed
        
        return False


class CanChangeLabTestStatus(permissions.BasePermission):
    """Allow only lab technicians to mark tests as completed."""
    message = "Only lab technicians can update test status."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return IsLabTechnician().has_permission(request, view)