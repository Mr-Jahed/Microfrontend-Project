from django.core.management.base import BaseCommand
from customers.models import Customer


SEED_DATA = [
    {"name": "Rahul Sharma",   "email": "rahul@example.com",  "phone": "+91 9876543210", "company": "ABC Technologies", "status": "Active"},
    {"name": "Priya Patil",    "email": "priya@example.com",  "phone": "+91 9876543211", "company": "XYZ Solutions",    "status": "Active"},
    {"name": "Amit Kulkarni",  "email": "amit@example.com",   "phone": "+91 9876543212", "company": "TechWorld",        "status": "Inactive"},
    {"name": "Sneha Desai",    "email": "sneha@example.com",  "phone": "+91 9876543213", "company": "DataSoft",         "status": "Active"},
    {"name": "Vikram Mehta",   "email": "vikram@example.com", "phone": "+91 9876543214", "company": "CloudBase",        "status": "Active"},
]


class Command(BaseCommand):
    help = "Seed the database with sample customer data"

    def handle(self, *args, **kwargs):
        created = 0
        for data in SEED_DATA:
            _, was_created = Customer.objects.get_or_create(
                email=data["email"],
                defaults=data,
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Seeded {created} customers. ({len(SEED_DATA) - created} already existed)")
        )
