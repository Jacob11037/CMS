from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType
from .models import Pharmacist

# Assuming 'pharmacist_user' is an instance of User
pharmacist_user = User.objects.get(username='pharmacist_username')

# Get the Pharmacist model's content type
content_type = ContentType.objects.get_for_model(Pharmacist)

# Define the permissions to assign
permissions = [
    'can_add_medicine',
    'can_update_medicine',
    'can_delete_medicine',
    'can_view_medicine',
    'can_process_prescription',
]

# Assign each permission to the user
for perm_codename in permissions:
    permission = Permission.objects.get(
        codename=perm_codename,
        content_type=content_type
    )
    pharmacist_user.user_permissions.add(permission)
