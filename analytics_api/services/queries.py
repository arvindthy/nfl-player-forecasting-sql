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
