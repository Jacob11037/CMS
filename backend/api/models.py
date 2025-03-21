from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from rest_framework.exceptions import ValidationError


# Create your models here.

class Receptionist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    staff_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, null=True)


    def save (self, *args, **kwargs):
        if not self.staff_id:
            last_receptionist = Receptionist.objects.order_by('-staff_id').first()

            if last_receptionist:
                last_receptionist_num = int(last_receptionist.staff_id[2:])
                new_receptionist_num = last_receptionist_num + 1
            else:
                new_receptionist_num = 1001

            self.staff_id = f"RP{new_receptionist_num:04d}"

        super().save(*args,**kwargs)

    def __str__(self):
        return self.staff_id

class Patient(models.Model):
    first_name = models.CharField(max_length=30, null=False, blank=False)  # Required field
    last_name = models.CharField(max_length=30, null=False, blank=False)   # Required field
    date_of_birth = models.DateField(null=False, blank=False)  # Required
    blood_group = models.CharField(
        max_length=20,
        choices=[('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('O+', 'O+')
                 , ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-')],
        default='A+'
    )
    phone = models.CharField(max_length=10, null=False, blank=False)  # Required field
    email = models.EmailField(null=True, blank=True)  # Optional field
    address = models.TextField(null=True, blank=True)  # Optional field

    def __str__(self):
        return f"{self.first_name} {self.last_name}"



class Department(models.Model):
    department_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.department_name

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    staff_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=25)
    last_name = models.CharField(max_length=25)
    department_id = models.ForeignKey(Department, on_delete=models.CASCADE, null=False, blank=False, default= 1)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, null=True)


    def save (self, *args, **kwargs):
        if not self.staff_id:
            last_doctor = Doctor.objects.order_by('-id').first()

            if last_doctor:
                last_doctor_num = int(last_doctor.staff_id[2:])
                new_doctor_num = last_doctor_num + 1
            else:
                new_doctor_num = 1001

            self.staff_id = f"DR{new_doctor_num:04d}"

        super().save(*args,**kwargs)

    def __str__(self):
        return self.staff_id


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=False, blank=False)
    doctor = models.ForeignKey(Doctor, to_field='staff_id', on_delete=models.CASCADE, null=False, blank=False)
    start_time = models.DateTimeField(null=False, blank=False)
    end_time = models.DateTimeField(null=False, blank=False)
    status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')],
        default='Pending'
    )

    @property
    def patient_name(self):
        """Return the patient's full name."""
        return f"{self.patient.first_name} {self.patient.last_name}"

    def clean(self):
        """ Ensure no overlapping appointments and validate time constraints """
        now = timezone.now()  # Current date and time
        max_future_date = now + timezone.timedelta(days=3)  # 3 days in the future

        # Check if start time is in the past
        if self.start_time < now:
            raise ValidationError("Start time cannot be in the past.")

        # Check if start time is more than 3 days in the future
        if self.start_time > max_future_date:
            raise ValidationError("Start time cannot be more than 3 days in the future.")

        # Check if end time is in the past
        if self.end_time < now:
            raise ValidationError("End time cannot be in the past.")

        # Check if end time is more than 3 days in the future
        if self.end_time > max_future_date:
            raise ValidationError("End time cannot be more than 3 days in the future.")

        # Check if end time is after start time
        if self.end_time <= self.start_time:
            raise ValidationError("End time must be after start time.")

        # Check for overlapping appointments on the same date
        overlapping_appointments = Appointment.objects.filter(
            doctor=self.doctor,
            start_time__date=self.start_time.date(),  # Check if the date of the start time is the same
            end_time__gte=self.start_time,  # Check if the existing appointment overlaps with the new one
            start_time__lte=self.end_time  # Check if the new appointment overlaps with the existing one
        ).exclude(id=self.id)  # Exclude the current instance when updating

        if overlapping_appointments.exists():
            raise ValidationError("This time slot is already booked on the selected date. Please choose another time.")

    def save(self, *args, **kwargs):
        """ Call the clean method before saving """
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Appointment for {self.patient.first_name} {self.patient.last_name} with {self.doctor.first_name} {self.doctor.last_name} from {self.start_time.strftime('%Y-%m-%d %H:%M')} to {self.end_time.strftime('%H:%M')}"
class PrescriptionBill(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=False, blank=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, null=False, blank=False)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)  # Required field
    bill_date = models.DateTimeField(auto_now_add=True, null=False, blank=False)  # Auto-generated date
    paid = models.BooleanField(default=False, null=False, blank=False)  # Required field

    def __str__(self):
        return f"Bill for {self.patient} - Amount: {self.amount}"


class ConsultationBill(models.Model):  # Renamed from AppointmentBill
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bill_date = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Consultation Bill for {self.patient} - Amount: {self.amount}"


class Medicine(models.Model):
    medicine_name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    medicine_desc = models.CharField(max_length=200)

    def __str__(self):
        return self.medicine_name


class LabTest(models.Model):
    test_name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    test_desc = models.CharField(max_length=200)

    def __str__(self):
        return self.test_name


class Prescription(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor,to_field='staff_id', on_delete=models.CASCADE)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    medicines = models.ManyToManyField(Medicine, through="PrescriptionMedicine")  # Custom intermediate table
    lab_tests = models.ManyToManyField(LabTest, through="PrescriptionLabTest")  # Custom intermediate table
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Prescription for {self.patient} on {self.appointment.appointment_date}"


# Custom Intermediate Table for Prescription-Medicine (Many-to-Many with Extra Fields)
class PrescriptionMedicine(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=50)  # E.g., "500mg"
    frequency = models.CharField(max_length=50)  # E.g., "Twice a day"

    def __str__(self):
        return f"{self.medicine.medicine_name} for {self.prescription.patient}"


# Custom Intermediate Table for Prescription-LabTest (Many-to-Many with Extra Fields)
class PrescriptionLabTest(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE)
    lab_test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    test_date = models.DateField()

    def __str__(self):
        return f"{self.lab_test.test_name} for {self.prescription.patient}"

class MedicalHistory(models.Model):
    patient = models.ForeignKey(Patient, related_name="medical_history", on_delete=models.CASCADE)
    diagnosis = models.CharField(max_length=255, null=True, blank=True)  # Allow empty
    prescription = models.ForeignKey(Prescription, null=True, blank=True, on_delete=models.SET_NULL,related_name="medical_histories")  # Allow empty
    medical_notes = models.TextField(null=True, blank=True)  # Allow empty
    date_of_occurrence = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Medical History for {self.patient} - {self.diagnosis} ({self.date_of_occurrence})"

#
# @receiver(post_save, sender=Patient)
# def create_medical_history(sender, instance, created, **kwargs):
#     if created:
#         MedicalHistory.objects.create(patient=instance)

