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
    fetch_games,
    fetch_team_codes,
    fetch_team_roster,
    fetch_postseason_games,
    fetch_home_cache,
    fetch_latest_home_cache,
    fetch_player_reg_aggregate,
)

def overview_view(request):
    cache = fetch_latest_home_cache()
    if cache and cache.get("overview"):
        return JsonResponse(
            {
                **cache["overview"],
                "last_updated": cache["last_updated"],
            }
        )

    data = fetch_overview()
    return JsonResponse({**data, "last_updated": None})

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

    cache = fetch_home_cache(season)
    if cache and cache.get("metrics"):
        return JsonResponse(
            {
                "season": season,
                "metrics": cache["metrics"],
                "last_updated": cache["last_updated"],
            }
        )

    metrics = fetch_metrics(season)
    return JsonResponse(
        {
            "season": season,
            "metrics": metrics,
            "last_updated": None,
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

    cache = fetch_home_cache(season)
    if cache and cache.get("metrics_by_position"):
        return JsonResponse(
            {
                "season": season,
                "metrics": cache["metrics_by_position"],
                "last_updated": cache["last_updated"],
            }
        )

    metrics = fetch_metrics_by_position(season)
    return JsonResponse(
        {
            "season": season,
            "metrics": metrics,
            "last_updated": None,
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

    cache = fetch_home_cache(season)
    if cache and cache.get("weekly_mae"):
        return JsonResponse(
            {
                "season": season,
                "weekly_mae": cache["weekly_mae"],
                "last_updated": cache["last_updated"],
            }
        )

    weekly_mae = fetch_weekly_mae(season)
    return JsonResponse(
        {
            "season": season,
            "weekly_mae": weekly_mae,
            "last_updated": None,
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
    non_reg_records = []
    try:
        with csv_path.open(newline="", encoding="utf-8", errors="ignore") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                name_match = row.get("player_name", "").strip().lower()
                display_match = row.get("player_display_name", "").strip().lower()
                team_match = row.get("recent_team", "").strip().lower()
                position_match = row.get("position", "").strip().lower()
                season_type = row.get("season_type", "").strip().upper()
                if normalized not in {name_match, display_match}:
                    continue

                if normalized_team and team_match != normalized_team:
                    fallback_records.append(row)
                    continue

                if normalized_position and position_match != normalized_position:
                    fallback_records.append(row)
                    continue

                if season_type and season_type != "REG":
                    non_reg_records.append(row)
                else:
                    records.append(row)
    except Exception as exc:
        return add_cors_headers(
            request,
            JsonResponse({"detail": f"Failed to read season data: {exc}"}, status=500),
        )

    if not records and fallback_records:
        records = fallback_records

    if not records:
        reg_aggregate = fetch_player_reg_aggregate(
            season=season,
            player_name=player_name,
            team=normalized_team if normalized_team else None,
            position=normalized_position if normalized_position else None,
        )
        if reg_aggregate:
            records = [reg_aggregate]

    if not records and non_reg_records:
        records = non_reg_records

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


def mvp_view(request):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    if request.method != "GET":
        return add_cors_headers(request, HttpResponse(status=405))

    season = request.GET.get("season")
    if not season:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season is required."}, status=400),
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

    best_row = None
    best_points = None
    with csv_path.open(newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            raw = row.get("fantasy_points_ppr")
            if raw is None or raw == "":
                continue
            try:
                points = float(raw)
            except ValueError:
                continue
            if best_points is None or points > best_points:
                best_points = points
                best_row = row

    if not best_row:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "No fantasy points found."}, status=404),
        )

    payload = {
        "season": season,
        "player_id": best_row.get("player_id"),
        "player_name": best_row.get("player_name"),
        "player_display_name": best_row.get("player_display_name"),
        "position": best_row.get("position"),
        "recent_team": best_row.get("recent_team"),
        "fantasy_points_ppr": best_points,
        "headshot_url": best_row.get("headshot_url"),
        "last_updated": None,
    }
    return add_cors_headers(request, JsonResponse(payload))


def mvp_by_position_view(request):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    if request.method != "GET":
        return add_cors_headers(request, HttpResponse(status=405))

    season = request.GET.get("season")
    if not season:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season is required."}, status=400),
        )

    try:
        season = int(season)
    except ValueError:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season must be an integer."}, status=400),
        )

    cache = fetch_home_cache(season)
    if cache and cache.get("mvp_by_position"):
        mvps = cache["mvp_by_position"]
        missing_ids = {
            entry.get("player_id")
            for entry in mvps.values()
            if entry.get("player_id") and not entry.get("headshot_url")
        }
        headshots = _load_headshot_urls(season, missing_ids) if missing_ids else {}
        enriched = {}
        for position, entry in mvps.items():
            entry_copy = dict(entry)
            if entry_copy.get("player_id") and not entry_copy.get("headshot_url"):
                entry_copy["headshot_url"] = headshots.get(entry_copy["player_id"])
            enriched[position] = entry_copy
        return add_cors_headers(
            request,
            JsonResponse(
                {
                    "season": season,
                    "mvps": enriched,
                    "last_updated": cache["last_updated"],
                }
            ),
        )

    csv_path = Path(settings.BASE_DIR) / "data" / "raw" / "players" / f"stats_player_regpost_{season}.csv"
    if not csv_path.exists():
        return add_cors_headers(
            request,
            JsonResponse({"detail": "Season data not found."}, status=404),
        )

    best_by_position = {}
    with csv_path.open(newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            position = (row.get("position") or "").strip()
            if not position:
                continue
            raw = row.get("fantasy_points_ppr")
            if raw is None or raw == "":
                continue
            try:
                points = float(raw)
            except ValueError:
                continue
            current = best_by_position.get(position)
            if current is None or points > current["fantasy_points_ppr"]:
                best_by_position[position] = {
                    "player_id": row.get("player_id"),
                    "player_name": row.get("player_name"),
                    "player_display_name": row.get("player_display_name"),
                    "position": position,
                    "recent_team": row.get("recent_team"),
                    "fantasy_points_ppr": points,
                    "headshot_url": row.get("headshot_url"),
                }

    if not best_by_position:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "No fantasy points found."}, status=404),
        )

    return add_cors_headers(
        request,
        JsonResponse(
            {"season": season, "mvps": best_by_position, "last_updated": None}
        ),
    )


def games_view(request):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    if request.method != "GET":
        return add_cors_headers(request, HttpResponse(status=405))

    def parse_multi_int(value):
        if not value:
            return []
        return [int(v) for v in value.split(",") if v.strip().isdigit()]

    def parse_multi_str(value):
        if not value:
            return []
        return [v.strip() for v in value.split(",") if v.strip()]

    def parse_float(value):
        if value is None or value == "":
            return None
        try:
            return float(value)
        except ValueError:
            return None

    def parse_bool(value):
        if value is None or value == "":
            return None
        value = value.lower()
        if value in {"true", "1", "yes"}:
            return True
        if value in {"false", "0", "no"}:
            return False
        return None

    filters = {
        "seasons": parse_multi_int(request.GET.get("season")),
        "weeks": parse_multi_int(request.GET.get("week")),
        "team": request.GET.get("team"),
        "game_types": parse_multi_str(request.GET.get("game_type")),
        "div_game": parse_bool(request.GET.get("div_game")),
        "spread_min": parse_float(request.GET.get("spread_min")),
        "spread_max": parse_float(request.GET.get("spread_max")),
        "total_min": parse_float(request.GET.get("total_min")),
        "total_max": parse_float(request.GET.get("total_max")),
        "roof": parse_multi_str(request.GET.get("roof")),
        "surface": parse_multi_str(request.GET.get("surface")),
        "temp_min": parse_float(request.GET.get("temp_min")),
        "temp_max": parse_float(request.GET.get("temp_max")),
        "wind_min": parse_float(request.GET.get("wind_min")),
        "wind_max": parse_float(request.GET.get("wind_max")),
    }

    data = fetch_games(filters)
    return add_cors_headers(request, JsonResponse(data))

def teams_view(request):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    if request.method != "GET":
        return add_cors_headers(request, HttpResponse(status=405))

    season = request.GET.get("season")
    if not season:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season is required."}, status=400),
        )

    try:
        season = int(season)
    except ValueError:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season must be an integer."}, status=400),
        )

    team_codes = fetch_team_codes(season)
    team_meta = load_team_metadata()
    postseason_games = fetch_postseason_games(season)
    honors = build_postseason_honors(postseason_games, team_meta)
    payload = []
    for code in team_codes:
        meta = team_meta.get(code.upper(), {})
        payload.append(
            {
                "code": code,
                "name": meta.get("name") or code,
                "city": meta.get("city", ""),
                "conference": meta.get("conference", ""),
                "division": meta.get("division", ""),
                "description": None,
            }
        )

    return add_cors_headers(
        request,
        JsonResponse(
            {
                "season": season,
                "teams": payload,
                "honors": honors,
            }
        ),
    )


def team_roster_view(request, team_code):
    if request.method == "OPTIONS":
        return add_cors_headers(request, HttpResponse(status=200))

    if request.method != "GET":
        return add_cors_headers(request, HttpResponse(status=405))

    season = request.GET.get("season")
    if not season:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season is required."}, status=400),
        )

    try:
        season = int(season)
    except ValueError:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "season must be an integer."}, status=400),
        )

    team_code = team_code.upper()
    team_meta = load_team_metadata()
    if team_code not in team_meta:
        return add_cors_headers(
            request,
            JsonResponse({"detail": "Team not found."}, status=404),
        )

    position_order = ["QB", "RB", "WR", "TE"]
    def role_hint(position, index):
        if position in {"QB", "RB", "WR", "TE"}:
            return f"{position} {index + 1}"
        return ""

    raw_roster = fetch_team_roster(season, team_code)
    roster = []
    for position in position_order:
        players = [data for data in raw_roster if data["position"] == position]
        if season == 2025:
            def sort_value(player):
                if position == "QB":
                    return player.get("passing_yards") or 0
                if position == "RB":
                    return player.get("rushing_yards") or 0
                if position in {"WR", "TE"}:
                    return player.get("receiving_yards") or 0
                return 0
            players.sort(
                key=lambda player: (-sort_value(player), player["player_display_name"])
            )
        else:
            players.sort(
                key=lambda player: (
                    -player.get("fantasy_points_ppr", 0),
                    player["player_display_name"],
                )
            )
        for index, player in enumerate(players):
            roster.append(
                {
                    **player,
                    "role_hint": role_hint(position, index),
                    "rank_in_position": index + 1,
                }
            )

    return add_cors_headers(
        request,
        JsonResponse(
            {
                "season": season,
                "team": {
                    "code": team_code,
                    "name": team_meta[team_code].get("name") or team_code,
                    "city": team_meta[team_code].get("city", ""),
                    "conference": team_meta[team_code].get("conference", ""),
                    "division": team_meta[team_code].get("division", ""),
                },
                "roster": roster,
            }
        ),
    )


def load_team_metadata():
    csv_path = (
        Path(settings.BASE_DIR)
        / "data"
        / "raw"
        / "games"
        / "teams_colors_logos.csv"
    )
    if not csv_path.exists():
        return {}

    meta = {}
    with csv_path.open(newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            code = (row.get("team_abbr") or "").strip().upper()
            if not code:
                continue
            division_raw = (row.get("team_division") or "").strip()
            if division_raw.startswith("AFC "):
                division = division_raw.replace("AFC ", "", 1)
            elif division_raw.startswith("NFC "):
                division = division_raw.replace("NFC ", "", 1)
            else:
                division = division_raw

            meta[code] = {
                "name": row.get("team_name", "").strip(),
                "city": row.get("team_name", "").strip(),
                "conference": (row.get("team_conf") or "").strip(),
                "division": division,
            }
    alias_map = {
        "LA": "LAR",
        "STL": "LAR",
        "SD": "LAC",
        "OAK": "LV",
        "WSH": "WAS",
    }
    for alias, canonical in alias_map.items():
        if alias not in meta and canonical in meta:
            meta[alias] = meta[canonical]
    return meta


def _load_headshot_urls(season, player_ids):
    if not player_ids:
        return {}

    csv_path = (
        Path(settings.BASE_DIR)
        / "data"
        / "raw"
        / "players"
        / f"stats_player_regpost_{season}.csv"
    )
    if not csv_path.exists():
        return {}

    remaining = {str(pid) for pid in player_ids if pid}
    headshots = {}
    with csv_path.open(newline="", encoding="utf-8", errors="ignore") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            player_id = (row.get("player_id") or "").strip()
            if not player_id or player_id not in remaining:
                continue
            headshot = (row.get("headshot_url") or "").strip()
            headshots[player_id] = headshot or None
            remaining.discard(player_id)
            if not remaining:
                break
    return headshots


def build_postseason_honors(postseason_games, team_meta):
    def winner(game):
        if game["home_score"] is None or game["away_score"] is None:
            return None
        return (
            game["home_team"]
            if game["home_score"] > game["away_score"]
            else game["away_team"]
        )

    honors = {
        "super_bowl": None,
        "afc_champion": None,
        "nfc_champion": None,
    }

    for game in postseason_games:
        champ = winner(game)
        if champ is None:
            continue
        if game["game_type"] == "SB":
            honors["super_bowl"] = champ
            continue
        if game["game_type"] == "CON":
            home_conf = team_meta.get(game["home_team"], {}).get("conference")
            away_conf = team_meta.get(game["away_team"], {}).get("conference")
            conference = home_conf or away_conf
            if conference == "AFC":
                honors["afc_champion"] = champ
            elif conference == "NFC":
                honors["nfc_champion"] = champ

    return honors


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
