from django.apps import AppConfig

class PharmacyConfig(AppConfig):
    name = 'pharmacist'

    def ready(self):
        from django.contrib.auth.models import Permission
        from django.contrib.contenttypes.models import ContentType
        from api.models import Pharmacist

        # Define custom permissions
        content_type = ContentType.objects.get_for_model(Pharmacist)
        permissions = [
            ('can_add_medicine', 'Can add medicine'),
            ('can_update_medicine', 'Can update medicine'),
            ('can_delete_medicine', 'Can delete medicine'),
            ('can_view_medicine', 'Can view medicine'),
            ('can_process_prescription', 'Can process prescription'),
        ]

        for codename, name in permissions:
            Permission.objects.get_or_create(
                codename=codename,
                name=name,
                content_type=content_type
            )
