import csv
import json
from pathlib import Path
from functools import wraps
from django.conf import settings
from django.contrib.auth import authenticate
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import ApiToken
from .services.queries import (
    fetch_overview,
    fetch_forecasts,
    fetch_backtest,
    fetch_metrics,
    fetch_metrics_by_position,
    fetch_outliers,
    fetch_filters,
    fetch_weekly_mae,
)

def overview_view(request):
    data = fetch_overview()
    return JsonResponse(data)

def forecasts_view(request):
    season = request.GET.get("season")
    week = request.GET.get("week")
    position = request.GET.get("position")
    limit = request.GET.get("limit", "50")

    missing = [name for name, value in [("season", season), ("week", week), ("position", position)] if not value]
    if missing:
        return JsonResponse(
            {"error": f"Missing required query parameters: {', '.join(missing)}"},
            status=400,
        )

    try:
        season = int(season)
        week = int(week)
        limit = int(limit)
    except ValueError:
        return JsonResponse(
            {"error": "Query parameters season, week, and limit must be integers."},
            status=400,
        )

    results = fetch_forecasts(season, week, position, limit)
    return JsonResponse(
        {
            "season": season,
            "week": week,
            "position": position,
            "results": results,
        }
    )

def backtest_view(request):
    season = request.GET.get("season")
    week = request.GET.get("week")
    position = request.GET.get("position")
    limit = request.GET.get("limit", "50")

    missing = [name for name, value in [("season", season), ("week", week), ("position", position)] if not value]
    if missing:
        return JsonResponse(
            {"error": f"Missing required query parameters: {', '.join(missing)}"},
            status=400,
        )

    try:
        season = int(season)
        week = int(week)
        limit = int(limit)
    except ValueError:
        return JsonResponse(
            {"error": "Query parameters season, week, and limit must be integers."},
            status=400,
        )

    results = fetch_backtest(season, week, position, limit)
    return JsonResponse(
        {
            "season": season,
            "week": week,
            "position": position,
            "results": results,
        }
    )

def metrics_view(request):
    season = request.GET.get("season")
    if not season:
        return JsonResponse(
            {"error": "Missing required query parameter: season"},
            status=400,
        )

    if "week" in request.GET or "position" in request.GET:
        return JsonResponse(
            {"error": "Query parameters week and position are not supported for this endpoint."},
            status=400,
        )

    try:
        season = int(season)
    except ValueError:
        return JsonResponse(
            {"error": "Query parameter season must be an integer."},
            status=400,
        )

    metrics = fetch_metrics(season)
    return JsonResponse(
        {
            "season": season,
            "metrics": metrics,
        }
    )

def metrics_by_position_view(request):
    season = request.GET.get("season")
    if not season:
        return JsonResponse(
            {"error": "Missing required query parameter: season"},
            status=400,
        )

    try:
        season = int(season)
    except ValueError:
        return JsonResponse(
            {"error": "Query parameter season must be an integer."},
            status=400,
        )

    metrics = fetch_metrics_by_position(season)
    return JsonResponse(
        {
            "season": season,
            "metrics": metrics,
        }
    )

def outliers_view(request):
    season = request.GET.get("season")
    limit = request.GET.get("limit", "25")
    if not season:
        return JsonResponse(
            {"error": "Missing required query parameter: season"},
            status=400,
        )

    try:
        season = int(season)
        limit = int(limit)
    except ValueError:
        return JsonResponse(
            {"error": "Query parameters season and limit must be integers."},
            status=400,
        )

    results = fetch_outliers(season, limit)
    return JsonResponse(
        {
            "season": season,
            "results": results,
        }
    )

def filters_view(request):
    data = fetch_filters()
    return JsonResponse(data)

def metrics_by_week_view(request):
    season = request.GET.get("season")
    if not season:
        return JsonResponse(
            {"error": "Missing required query parameter: season"},
            status=400,
        )

    try:
        season = int(season)
    except ValueError:
        return JsonResponse(
            {"error": "Query parameter season must be an integer."},
            status=400,
        )

    weekly_mae = fetch_weekly_mae(season)
    return JsonResponse(
        {
            "season": season,
            "weekly_mae": weekly_mae,
        }
    )


def player_details_view(request):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    if request.method != "GET":
        return add_cors_headers(request, HttpResponse(status=405))

    season = request.GET.get("season")
    player_name = request.GET.get("player")
    team = request.GET.get("team")
    position = request.GET.get("position")
    if not season or not player_name:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season and player are required."}, status=400),
        )

    try:
        season = int(season)
    except ValueError:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season must be an integer."}, status=400),
        )

    csv_path = Path(settings.BASE_DIR) / "data" / "raw" / "players" / f"stats_player_regpost_{season}.csv"
    if not csv_path.exists():
        return add_cors_headers(
            request,
            JsonResponse({"detail": "Season data not found."}, status=404),
        )

    normalized = player_name.strip().lower()
    normalized_team = (team or "").strip().lower()
    normalized_position = (position or "").strip().lower()
    records = []
    fallback_records = []
    with csv_path.open(newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            name_match = row.get("player_name", "").strip().lower()
            display_match = row.get("player_display_name", "").strip().lower()
            team_match = row.get("recent_team", "").strip().lower()
            position_match = row.get("position", "").strip().lower()
            if normalized not in {name_match, display_match}:
                continue

            if normalized_team and team_match != normalized_team:
                fallback_records.append(row)
                continue

            if normalized_position and position_match != normalized_position:
                fallback_records.append(row)
                continue

            records.append(row)

    if not records and fallback_records:
        records = fallback_records

    if not records:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "Player not found for season."}, status=404),
        )

    return add_cors_headers(
        request,
        JsonResponse(
            {
                "season": season,
                "player_name": player_name,
                "records": records,
            }
        ),
    )


def add_cors_headers(request, response):
    origin = request.META.get("HTTP_ORIGIN") or "*"
    response["Access-Control-Allow-Origin"] = origin
    response["Access-Control-Allow-Credentials"] = "true"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def token_auth_required(view_func):
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if request.method == "OPTIONS":
            return add_cors_headers(request, HttpResponse(status=200))

        header = request.META.get("HTTP_AUTHORIZATION", "")
        if not header.startswith("Token "):
            return add_cors_headers(
                request,
                JsonResponse(
                    {"detail": "Authentication credentials were not provided."},
                    status=401,
                ),
            )

        key = header.split(" ", 1)[1].strip()
        if not key:
            return add_cors_headers(
                request,
                JsonResponse({"detail": "Invalid token."}, status=401),
            )

        try:
            token = ApiToken.objects.select_related("user").get(key=key)
        except ApiToken.DoesNotExist:
            return add_cors_headers(
                request,
                JsonResponse({"detail": "Invalid token."}, status=401),
            )

        request.user = token.user
        response = view_func(request, *args, **kwargs)
        return add_cors_headers(request, response)

    return _wrapped


@csrf_exempt
def login_view(request):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    if request.method != "POST":
        return add_cors_headers(request, HttpResponse(status=405))

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "Invalid JSON payload."}, status=400),
        )

    username = payload.get("username")
    password = payload.get("password")
    if not username or not password:
        return add_cors_headers(
            request,
            JsonResponse(
                {"detail": "Username and password are required."},
                status=400,
            ),
        )

    user = authenticate(request, username=username, password=password)
    if not user:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "Invalid credentials."}, status=400),
        )

    token, created = ApiToken.objects.get_or_create(
        user=user,
        defaults={"key": ApiToken.generate_key()},
    )
    if not created and not token.key:
        token.key = ApiToken.generate_key()
        token.save(update_fields=["key"])

    return add_cors_headers(request, JsonResponse({"token": token.key}))
