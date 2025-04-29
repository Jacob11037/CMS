from django.db import models

class Medicine(models.Model):
    medicine_name = models.CharField(max_length=100, unique=True)  # Changed from 'name' to 'medicine_name'
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    manufacturer = models.CharField(max_length=100)
    requires_prescription = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.medicine_name  # Updated to use medicine_name

    class Meta:
        ordering = ['medicine_name']  # Updated to use medicine_name
