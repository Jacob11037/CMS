from rest_framework import permissions
from .models import Doctor, Receptionist, Appointment, PrescriptionBill, Prescription, \
    PrescriptionMedicine, PrescriptionLabTest, MedicalHistory, ConsultationBill, Department, \
    Patient  # Import your Doctor model

class IsAdmin(permissions.BasePermission):

    def has_permission(self, request, view):
        return request.user.is_superuser or request.user.groups.filter(name="Admin").exists()

class IsDoctor(permissions.BasePermission):
    """
    Custom permission to allow only users who are doctors to access certain views.
    """

    def has_permission(self, request, view):
        """
        Check if the user is authenticated and belongs to a doctor.
        This is for general access to views, not specific objects.
        """

        # Check if the user is authenticated and is linked to a Doctor
        if request.user and request.user.is_authenticated:
            return Doctor.objects.filter(user=request.user).exists()
        return False

    def has_object_permission(self, request, view, obj):
        """
        Check if the requesting user (doctor) is allowed to access the object.
        The doctor should only be able to access their own prescriptions, appointments, and related data.
        """
        # Allow full access to admins
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return True

        if hasattr(obj, "doctor"):  # Direct doctor reference (Appointment)
            return obj.doctor.staff_id == request.user.doctor.staff_id

        if hasattr(obj,
                   "prescription"):  # Related via Prescription (MedicalHistory, PrescriptionMedicine, PrescriptionLabTest)
            return obj.prescription.appointment.doctor.staff_id == request.user.doctor.staff_id

        return False  # Deny access for any other objects


class IsReceptionist(permissions.BasePermission):
    """
    Custom permission to allow only users who are receptionists.
    Receptionists can manage appointments and billing but cannot access prescriptions or medical history.
    Admins have full access.
    """

    def has_permission(self, request, view):
        # Allow full access to admins
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return True

        # Ensure the user is authenticated and is a Receptionist
        return request.user.is_authenticated and Receptionist.objects.filter(user=request.user).exists()

    def has_object_permission(self, request, view, obj):
        # Allow full access to admins
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return True

        # Receptionists can manage appointments and billing
        if isinstance(obj, (Appointment, PrescriptionBill, Patient, Department, ConsultationBill)):
            return True

        # Restrict access to prescriptions and medical history
        return False
