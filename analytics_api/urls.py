from django.urls import path, include
from . import views

urlpatterns = [
    path("overview/", views.overview_view, name="analytics-overview"),
    path("forecasts/", views.forecasts_view, name="analytics-forecasts"),
    path("backtest/", views.backtest_view, name="analytics-backtest"),
    path("metrics/", views.metrics_view, name="analytics-metrics"),
    path("metrics/by-position/", views.metrics_by_position_view, name="analytics-metrics-by-position"),
    path("metrics/by-week/", views.metrics_by_week_view, name="analytics-metrics-by-week"),
    path("outliers/", views.outliers_view, name="analytics-outliers"),
    path("filters/", views.filters_view, name="analytics-filters"),
]
