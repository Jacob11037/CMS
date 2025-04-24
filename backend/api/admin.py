from django.contrib import admin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django import forms
from django.contrib.auth.models import User
from rest_framework.exceptions import ValidationError

from .models import Receptionist, Doctor, Patient, Department, Appointment, MedicalHistory, Medicine, LabTest,Prescription,LabTechnician

# # Admin form for creating a new user (admin will enter username and password)
# class ReceptionistAdminForm(forms.ModelForm):
#     username = forms.CharField(max_length=150, required=True)
#     password = forms.CharField(widget=forms.PasswordInput(), required=False)  # Optional for updates
#     email = forms.EmailField(required=True)
#
#     class Meta:
#         model = Receptionist
#         fields = ['first_name', 'last_name', 'phone']
#
#     def save(self, commit=True):
#         receptionist = super().save(commit=False)
#
#         # Handle User creation or update
#         if receptionist.user_id:
#             user = receptionist.user
#             user.username = self.cleaned_data['username']
#             user.email = self.cleaned_data['email']
#             if self.cleaned_data['password']:  # Only update if a new password is given
#                 user.set_password(self.cleaned_data['password'])  # Hash the password
#             user.save()
#         else:
#             user = User.objects.create_user(
#                 username=self.cleaned_data['username'],
#                 password=self.cleaned_data['password'],
#                 email=self.cleaned_data['email']
#             )
#             receptionist.user = user  # Link the new user to the receptionist
#
#         if commit:
#             receptionist.save()
#         return receptionist
#
# class ReceptionistAdmin(admin.ModelAdmin):
#     form = ReceptionistAdminForm
#     list_display = ('get_username', 'first_name', 'last_name', 'phone')
#
#     def get_username(self, obj):
#         return obj.user.username if obj.user else "No User Assigned"
#
#     get_username.short_description = "Username"
#
#
# class DoctorAdminForm(forms.ModelForm):
#     username = forms.CharField(max_length=150, required=True)
#     password = forms.CharField(widget=forms.PasswordInput, required=True)
#     email = forms.EmailField(required=True)
#
#
#     class Meta:
#         model = Doctor
#         fields = ('first_name', 'last_name', 'department_id', 'phone')
#
#
#     def clean_password(self):
#         password = self.cleaned_data['password']
#         if len(password) < 8:
#             raise ValidationError('Password must be at least 8 characters long.')
#         return password
#
#     def save(self, commit=True):
#         doctor = super().save(commit=False)
#
#         # Create or update the linked User
#         if doctor.user_id:
#             user = doctor.user
#             user.username = self.cleaned_data['username']
#             user.email = self.cleaned_data['email']
#             if self.cleaned_data['password']:
#                 user.set_password(self.cleaned_data['password'])  # Hash password properly
#             user.save()
#         else:
#             user = User.objects.create_user(
#                 username=self.cleaned_data['username'],
#                 password=self.cleaned_data['password'],
#                 email=self.cleaned_data['email']
#             )
#             doctor.user = user  # Link user to doctor
#
#         if commit:
#             doctor.save()
#         return doctor
# # Admin for the Receptionist model
#
#
#
# class DoctorAdmin(admin.ModelAdmin):
#     form = DoctorAdminForm
#     list_display = ('get_username', 'first_name', 'last_name', 'get_department_name', 'phone')
#
#     def get_username(self, obj):
#         return obj.user.username
#     get_username.short_description = "Username"
#
#     def get_department_name(self, obj):
#         return obj.department_id.department_name
#     get_department_name.short_description = 'Department Name'
#
#
# admin.site.register(Doctor, DoctorAdmin)
# admin.site.register(Receptionist, ReceptionistAdmin)
admin.site.register(Patient)
admin.site.register(Department)
admin.site.register(Doctor)
admin.site.register(Receptionist)
admin.site.register(Appointment)
admin.site.register(MedicalHistory)
admin.site.register(Medicine)
admin.site.register(LabTest)
admin.site.register(LabTechnician)





