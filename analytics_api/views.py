from django.http import JsonResponse
from .services.queries import fetch_overview, fetch_forecasts

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
