from django.urls import path
from . import views

urlpatterns = [
    path("overview/", views.token_auth_required(views.overview_view), name="analytics-overview"),
    path("forecasts/", views.token_auth_required(views.forecasts_view), name="analytics-forecasts"),
    path("backtest/", views.token_auth_required(views.backtest_view), name="analytics-backtest"),
    path("metrics/", views.token_auth_required(views.metrics_view), name="analytics-metrics"),
    path(
        "metrics/by-position/",
        views.token_auth_required(views.metrics_by_position_view),
        name="analytics-metrics-by-position",
    ),
    path(
        "metrics/by-week/",
        views.token_auth_required(views.metrics_by_week_view),
        name="analytics-metrics-by-week",
    ),
    path("outliers/", views.token_auth_required(views.outliers_view), name="analytics-outliers"),
    path("filters/", views.token_auth_required(views.filters_view), name="analytics-filters"),
    path("player-details/", views.token_auth_required(views.player_details_view), name="analytics-player-details"),
    path("mvp/", views.token_auth_required(views.mvp_view), name="analytics-mvp"),
    path("mvp/by-position/", views.token_auth_required(views.mvp_by_position_view), name="analytics-mvp-by-position"),
    path("games/", views.token_auth_required(views.games_view), name="analytics-games"),
    path(
        "games/<str:game_id>/players/",
        views.token_auth_required(views.game_players_view),
        name="analytics-game-players",
    ),
    path("teams/", views.token_auth_required(views.teams_view), name="analytics-teams"),
    path(
        "teams/<str:team_code>/roster/",
        views.token_auth_required(views.team_roster_view),
        name="analytics-team-roster",
    ),
]
