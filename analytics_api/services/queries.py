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

def fetch_backtest(season, week, position, limit):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                player_name,
                team,
                forecast_ppr_points,
                actual_ppr_points,
                error,
                abs_error
            FROM analytics.player_week_backtest
            WHERE season = %s
              AND week = %s
              AND position = %s
            ORDER BY abs_error ASC
            LIMIT %s;
            """,
            [season, week, position, limit],
        )
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]

    return [dict(zip(columns, row)) for row in rows]

def fetch_metrics(season):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                (
                    SELECT AVG(abs_error)
                    FROM analytics.player_week_backtest
                    WHERE season = %s
                ) AS baseline_mae,
                (
                    SELECT AVG(error)
                    FROM analytics.player_week_backtest
                    WHERE season = %s
                ) AS baseline_bias,
                (
                    SELECT CASE WHEN %s = 2024 THEN AVG(abs_error) END
                    FROM analytics.player_week_backtest_weighted_2024
                ) AS weighted_mae,
                (
                    SELECT CASE WHEN %s = 2024 THEN AVG(error) END
                    FROM analytics.player_week_backtest_weighted_2024
                ) AS weighted_bias,
                (
                    SELECT AVG(ABS(a.ppr_points_calculated - f.forecast_ppr_points))
                    FROM analytics.player_week_forecast_enhanced f
                    JOIN analytics.player_game_facts_ppr a
                      ON f.player_id = a.player_id
                     AND f.season = a.season
                     AND f.forecast_week = a.week
                    WHERE f.season = %s
                ) AS enhanced_mae,
                (
                    SELECT AVG(a.ppr_points_calculated - f.forecast_ppr_points)
                    FROM analytics.player_week_forecast_enhanced f
                    JOIN analytics.player_game_facts_ppr a
                      ON f.player_id = a.player_id
                     AND f.season = a.season
                     AND f.forecast_week = a.week
                    WHERE f.season = %s
                ) AS enhanced_bias;
            """,
            [season, season, season, season, season, season],
        )
        row = cursor.fetchone()

    return {
        "mae": {
            "baseline": row[0],
            "weighted": row[2],
            "enhanced": row[4],
        },
        "bias": {
            "baseline": row[1],
            "weighted": row[3],
            "enhanced": row[5],
        },
    }

def fetch_metrics_by_position(season):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                position,
                AVG(abs_error) AS mae
            FROM analytics.player_week_backtest_2024
            GROUP BY position
            ORDER BY position;
            """,
        )
        rows = cursor.fetchall()

    return {row[0]: {"mae": row[1]} for row in rows}

def fetch_outliers(season, limit):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                player_name,
                week,
                position,
                forecast_ppr_points AS predicted,
                actual_ppr_points AS actual,
                abs_error
            FROM analytics.player_week_backtest
            WHERE season = %s
            ORDER BY abs_error DESC
            LIMIT %s;
            """,
            [season, limit],
        )
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]

    return [dict(zip(columns, row)) for row in rows]

def fetch_filters():
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT DISTINCT season
            FROM analytics.player_game_facts_ppr
            ORDER BY season;
            """
        )
        seasons = [row[0] for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT DISTINCT week
            FROM analytics.player_game_facts_ppr
            ORDER BY week;
            """
        )
        weeks = [row[0] for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT DISTINCT position
            FROM analytics.player_game_facts_ppr
            ORDER BY position;
            """
        )
        positions = [row[0] for row in cursor.fetchall()]

    return {
        "seasons": seasons,
        "weeks": weeks,
        "positions": positions,
    }

def fetch_weekly_mae(season):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                b.week,
                AVG(b.abs_error) AS mae
            FROM analytics.player_week_backtest_2024 b
            JOIN analytics.player_game_facts_ppr a
              ON b.player_id = a.player_id
             AND b.week = a.week
            WHERE a.season = %s
            GROUP BY b.week
            ORDER BY b.week;
            """,
            [season],
        )
        rows = cursor.fetchall()

    return [{"week": row[0], "mae": row[1]} for row in rows]
