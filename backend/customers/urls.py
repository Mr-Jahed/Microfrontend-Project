from django.urls import path
from . import views

urlpatterns = [
    path("", views.customer_list, name="customer-list"),
    path("<int:pk>/", views.customer_detail, name="customer-detail"),
]
