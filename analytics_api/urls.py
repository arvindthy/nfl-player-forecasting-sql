from django.urls import path, include
from . import views

urlpatterns = [
    path("overview/", views.overview_view, name="analytics-overview"),
    path("forecasts/", views.forecasts_view, name="analytics-forecasts"),
]
