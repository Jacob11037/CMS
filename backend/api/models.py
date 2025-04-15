from django.contrib.auth.models import User
from django.db import models
from django.db.models import CASCADE
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
    date_of_birth = models.DateField()
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)
    address = models.TextField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other')
    ]
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, null=True, blank=True)



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
    date_of_birth = models.DateField()
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)
    address = models.TextField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other')
    ]
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, null=True, blank=True)
    availability = models.BooleanField(default=True)

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

    def __str__(self):
        return f"Appointment for {self.patient.first_name} {self.patient.last_name} with {self.doctor.first_name} {self.doctor.last_name} from {self.start_time.strftime('%Y-%m-%d %H:%M')} to {self.end_time.strftime('%H:%M')}"



class Medicine(models.Model):
    medicine_name = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    medicine_desc = models.CharField(max_length=200)
    manufacturer = models.CharField(max_length=100)
    stock = models.PositiveIntegerField(default=0)

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
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.medicine.medicine_name} for {self.prescription.patient}"


# Custom Intermediate Table for Prescription-LabTest (Many-to-Many with Extra Fields)
class PrescriptionLabTest(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE)
    lab_test = models.ForeignKey(LabTest, on_delete=models.CASCADE)
    test_date = models.DateField()
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
    ]
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.lab_test.test_name} for {self.prescription.patient}"




class MedicalHistory(models.Model):
    patient = models.ForeignKey(Patient, related_name="medical_history", on_delete=models.CASCADE)
    diagnosis = models.CharField(max_length=255)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE,related_name="medical_histories")
    date_of_occurrence = models.DateField(auto_now_add=True)
    # medical_notes = models.TextField(null=True, blank=True)  # Allow empty

    def __str__(self):
        return f"Medical History for {self.patient} - {self.diagnosis} ({self.date_of_occurrence})"

#
# @receiver(post_save, sender=Patient)
# def create_medical_history(sender, instance, created, **kwargs):
#     if created:
#         MedicalHistory.objects.create(patient=instance)


#REPLACE WITH MEDICINE AND LABTESTBILL
# class PrescriptionBill(models.Model):
#     prescription = models.OneToOneField(Prescription, on_delete=CASCADE, null=False, blank=False)
#     patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=False, blank=False)
#     appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, null=False, blank=False)
#     amount = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)  # Required field
#     bill_date = models.DateTimeField(auto_now_add=True, null=False, blank=False)  # Auto-generated date
#     paid = models.BooleanField(default=False, null=False, blank=False)  # Required field
#
#     def __str__(self):
#         return f"Bill for {self.patient} - Amount: {self.amount}"

class Bill(models.Model):
    BILL_TYPES = [
        ('Medicine', 'Medicine'),
        ('Lab Test', 'Lab Test'),
    ]
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE)
    paid = models.BooleanField(default=False)
    bill_type = models.CharField(max_length=10, choices=BILL_TYPES)
    bill_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def calculate_total(self):
        """Calculate the total price based on bill type and quantity."""
        if self.bill_type == "Medicine":
            total = sum(
                pm.medicine.price * pm.quantity  # Multiply price by quantity
                for pm in PrescriptionMedicine.objects.filter(prescription=self.prescription)
            )
        elif self.bill_type == "Lab Test":
            total = sum(
                pl.lab_test.price  # Lab tests usually don’t have quantity
                for pl in PrescriptionLabTest.objects.filter(prescription=self.prescription)
            )
        else:
            total = 0

        self.total_amount = total

    def save(self, *args, **kwargs):
        self.calculate_total()
        super().save(*args, **kwargs)

class ConsultationBill(models.Model):  # Renamed from AppointmentBill
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    bill_date = models.DateTimeField(auto_now_add=True)
    paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Consultation Bill for {self.patient} - Amount: {self.amount}"

class Pharmacist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    staff_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, null=True)
    date_of_birth = models.DateField()
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)
    address = models.TextField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other')
    ]
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, null=True, blank=True)
    pharmacy_license= models.CharField(max_length=100, null=True, blank=True)

class LabTechnician(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,related_name='lab_technician'
)
    staff_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, null=True)
    date_of_birth = models.DateField()
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)
    address = models.TextField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other')
    ]
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, null=True, blank=True)
    lab_certification= models.CharField(max_length=100, null=True, blank=True)

    def save (self, *args, **kwargs):
        if not self.staff_id:
            last_labtechnician = LabTechnician.objects.order_by('-staff_id').first()

            if last_labtechnician:
                last_labtechnician_num = int(last_labtechnician. staff_id[2:])
                new_labtechnician_num = last_labtechnician_num + 1
            else:
                new_labtechnician_num = 1001

            self.staff_id = f"LT{new_labtechnician_num:04d}"

        super().save(*args,**kwargs)

    def __str__(self):
        return self.staff_id

class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    staff_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, null=True)
    date_of_birth = models.DateField()
    is_active = models.BooleanField(default=True)
    joining_date = models.DateField(auto_now_add=True)
    address = models.TextField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other')
    ]
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, null=True, blank=True)

