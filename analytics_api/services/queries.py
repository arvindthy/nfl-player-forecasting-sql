from django.db import connection

def fetch_overview():
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                MIN(season) AS min_season,
                MAX(season) AS max_season,
                COUNT(*)    AS total_player_games
            FROM analytics.player_game_facts_ppr;
            """
        )
        row = cursor.fetchone()

    return {
        "seasons": list(range(row[0], row[1] + 1)),
        "total_player_games": row[2],
        "positions": ["QB", "RB", "WR", "TE"],
    }

def fetch_forecasts(season, week, position, limit):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                player_name,
                team,
                forecast_ppr_points
            FROM analytics.player_week_forecast_enhanced
            WHERE season = %s
              AND forecast_week = %s
              AND position = %s
            ORDER BY forecast_ppr_points DESC
            LIMIT %s;
            """,
            [season, week, position, limit],
        )
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]

    return [dict(zip(columns, row)) for row in rows]
