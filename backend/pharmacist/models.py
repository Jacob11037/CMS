# class Medicine(models.Model):
#     Medicine_ID = models.AutoField(primary_key=True)
#     Medicine_Name = models.CharField(max_length=50, unique=True, null=False, blank=False)
#     Generic_Name = models.CharField(max_length=50, null=False, blank=False)
#     Company_Name = models.CharField(max_length=50, null=False, blank=False)
#     Price_Per_Unit = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(20)], null=False, blank=False)
#     Dosage = models.IntegerField(validators=[MinValueValidator(1)], null=False, blank=False)
    
#     def _str_(self):
#         return self.Medicine_Name

# class Medicine_Stock(models.Model):
#     Medicine_Stock_ID = models.AutoField(primary_key=True)
#     Medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, null=False, blank=False)
#     Available_Stock = models.IntegerField(validators=[MinValueValidator(0)], null=False, blank=False)
#     Expiry_Date = models.DateField(validators=[MinValueValidator(limit_value=date.today)], null=False, blank=False)
#     Manufacturing_Date = models.DateField(validators=[MaxValueValidator(limit_value=date.today)], null=False, blank=False)
#     Is_Available = models.BooleanField(default=True, null=False, blank=False)
    
#     def clean(self):
#         if self.Available_Stock > 0 and not self.Is_Available:
#             raise ValidationError("Is_Available must be True if stock is available.")
#         elif self.Available_Stock == 0 and self.Is_Available:
#             raise ValidationError("Is_Available must be False if stock is zero.")

#     def save(self, *args, **kwargs):
#         self.Is_Available = self.Available_Stock > 0
#         super().save(*args, **kwargs)
    
#     def _str_(self):
#         return f"{self.Medicine.Medicine_Name} - {self.Available_Stock} units"
