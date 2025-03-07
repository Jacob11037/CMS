from django.db import models

# Create your models here.

class Receptionist(models.Model):
    staff_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, null=True)


    def save (self, *args, **kwargs):
        if not self.staff_id:
            last_receptionist = Receptionist.objects.order_by('-id').first()

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
    date_of_birth = models.DateField(null=False, blank=False)  # Required field
    phone = models.CharField(max_length=10, null=False, blank=False)  # Required field
    email = models.EmailField(null=True, blank=True)  # Optional field
    address = models.TextField(null=True, blank=True)  # Optional field

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=False, blank=False)
    doctor_name = models.CharField(max_length=100, null=False, blank=False)  # Required field
    appointment_date = models.DateTimeField(null=False, blank=False)  # Required field
    status = models.CharField(
        max_length=20,
        choices=[('Pending', 'Pending'), ('Completed', 'Completed'), ('Cancelled', 'Cancelled')],
        default='Pending'
    )




    def __str__(self):
        return f"Appointment for {self.patient} with {self.doctor_name} on {self.appointment_date}"

class Bill(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=False, blank=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, null=False, blank=False)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=False, blank=False)  # Required field
    bill_date = models.DateTimeField(auto_now_add=True, null=False, blank=False)  # Auto-generated date
    paid = models.BooleanField(default=False, null=False, blank=False)  # Required field

    def __str__(self):
        return f"Bill for {self.patient} - Amount: {self.amount}"


class Doctor(models.Model):
    staff_id = models.CharField(max_length=10, unique=True)
    first_name = models.CharField(max_length=25)
    last_name = models.CharField(max_length=25)
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

            self.staff_id = f"RP{new_doctor_num:04d}"

        super().save(*args,**kwargs)

    def __str__(self):
        return self.staff_id

