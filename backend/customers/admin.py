from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "company", "status"]
    list_filter = ["status"]
    search_fields = ["name", "email", "company"]
