from django.db import models

# Create your models here.
class LabTechnician(models.Model):
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
    lab_certification= models.CharField(max_length=100, null=True, blank=True)

    def save (self, *args, **kwargs):
        if not self.staff_id:
            last_labtechnician = LabTechnician.objects.order_by('-staff_id').first()

            if last_labtechnician:
                last_labtechnician _num = int(last_labtechnician .staff_id[2:])
                new_labtechnician _num = last_labtechnician _num + 1
            else:
                new_labtechnician _num = 1001

            self.staff_id = f"LT{new_labtechnician _num:04d}"

        super().save(*args,**kwargs)

    def __str__(self):
        return self.staff_id

   
class LabReport(models.Model):
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE)  # Link to the full prescription
    remarks = models.TextField(blank=True)
    requested_by = models.CharField(max_length=100)  # Doctor's ID/name
    created_at = models.DateTimeField(auto_now_add=True)
    generated_by = models.ForeignKey(LabTechnician, on_delete=models.SET_NULL, null=True)
    report_pdf = models.FileField(upload_to='lab_reports/', null=True, blank=True)

    def __str__(self):
        return f"Lab Report for {self.prescription.patient} (ID: {self.id})"



class LabReportTestResult(models.Model):
    lab_report = models.ForeignKey(LabReport, on_delete=models.CASCADE)  # Parent report
    prescription_lab_test = models.ForeignKey(PrescriptionLabTest, on_delete=models.CASCADE)  # Specific test from prescription
    result_data = models.JSONField()  # Format: {"Hemoglobin": {"value": 14.2, "unit": "g/dL"}}

    def __str__(self):
        return f"Result for {self.prescription_lab_test.lab_test.test_name} in Report #{self.lab_report.id}"
