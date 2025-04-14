def get_user_role(user):
    groups = user.groups.all().values_list('name', flat=True)

    if user.is_superuser or 'Admin' in groups:
        return 'admin'
    elif 'Receptionist' in groups:
        return 'receptionist'
    elif 'Doctor' in groups:
        return 'doctor'
    elif 'Pharmacist' in groups:
        return 'pharmacist'
    elif 'LabTechnician' in groups:
        return 'labtechnician'
    else:
        return 'unknown'