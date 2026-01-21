from django.db import connection

def fetch_overview():
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                MIN(season) AS min_season,
                MAX(season) AS max_season,
                COUNT(*)    AS total_player_games
            FROM analytics.player_game_facts_ppr
            WHERE week BETWEEN 1 AND 18;
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
              AND forecast_week BETWEEN 1 AND 18
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
              AND week BETWEEN 1 AND 18
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
                    WHERE season = %s AND week BETWEEN 1 AND 18
                ) AS baseline_mae,
                (
                    SELECT AVG(error)
                    FROM analytics.player_week_backtest
                    WHERE season = %s AND week BETWEEN 1 AND 18
                ) AS baseline_bias,
                (
                    SELECT CASE WHEN %s = 2024 THEN AVG(abs_error) END
                    FROM analytics.player_week_backtest_weighted_2024
                    WHERE week BETWEEN 1 AND 18
                ) AS weighted_mae,
                (
                    SELECT CASE WHEN %s = 2024 THEN AVG(error) END
                    FROM analytics.player_week_backtest_weighted_2024
                    WHERE week BETWEEN 1 AND 18
                ) AS weighted_bias,
                (
                    SELECT AVG(ABS(a.ppr_points_calculated - f.forecast_ppr_points))
                    FROM analytics.player_week_forecast_enhanced f
                    JOIN analytics.player_game_facts_ppr a
                      ON f.player_id = a.player_id
                     AND f.season = a.season
                     AND f.forecast_week = a.week
                    WHERE f.season = %s
                      AND f.forecast_week BETWEEN 1 AND 18
                      AND a.week BETWEEN 1 AND 18
                ) AS enhanced_mae,
                (
                    SELECT AVG(a.ppr_points_calculated - f.forecast_ppr_points)
                    FROM analytics.player_week_forecast_enhanced f
                    JOIN analytics.player_game_facts_ppr a
                      ON f.player_id = a.player_id
                     AND f.season = a.season
                     AND f.forecast_week = a.week
                    WHERE f.season = %s
                      AND f.forecast_week BETWEEN 1 AND 18
                      AND a.week BETWEEN 1 AND 18
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
            WHERE week BETWEEN 1 AND 18
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
              AND week BETWEEN 1 AND 18
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
            WHERE week BETWEEN 1 AND 18
            ORDER BY season;
            """
        )
        seasons = [row[0] for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT DISTINCT week
            FROM analytics.player_game_facts_ppr
            WHERE week BETWEEN 1 AND 18
            ORDER BY week;
            """
        )
        weeks = [row[0] for row in cursor.fetchall()]

        cursor.execute(
            """
            SELECT DISTINCT position
            FROM analytics.player_game_facts_ppr
            WHERE week BETWEEN 1 AND 18
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
              AND a.week BETWEEN 1 AND 18
              AND b.week BETWEEN 1 AND 18
            GROUP BY b.week
            ORDER BY b.week;
            """,
            [season],
        )
        rows = cursor.fetchall()

    return [{"week": row[0], "mae": row[1]} for row in rows]


def fetch_games(filters):
    where_clauses = ["season BETWEEN 2018 AND 2024", "game_type = 'REG'", "week BETWEEN 1 AND 18"]
    params = []

    seasons = filters.get("seasons")
    if seasons:
        where_clauses.append("season = ANY(%s)")
        params.append(seasons)

    weeks = filters.get("weeks")
    if weeks:
        where_clauses.append("week = ANY(%s)")
        params.append(weeks)

    team = filters.get("team")
    if team:
        where_clauses.append("(home_team = %s OR away_team = %s)")
        params.extend([team, team])

    game_types = filters.get("game_types")
    if game_types:
        where_clauses.append("game_type = ANY(%s)")
        params.append(game_types)

    div_game = filters.get("div_game")
    if div_game is not None:
        where_clauses.append("div_game = %s")
        params.append(div_game)

    roof = filters.get("roof")
    if roof:
        where_clauses.append("roof = ANY(%s)")
        params.append(roof)

    surface = filters.get("surface")
    if surface:
        where_clauses.append("surface = ANY(%s)")
        params.append(surface)

    spread_min = filters.get("spread_min")
    if spread_min is not None:
        where_clauses.append("spread_line >= %s")
        params.append(spread_min)

    spread_max = filters.get("spread_max")
    if spread_max is not None:
        where_clauses.append("spread_line <= %s")
        params.append(spread_max)

    total_min = filters.get("total_min")
    if total_min is not None:
        where_clauses.append("total_line >= %s")
        params.append(total_min)

    total_max = filters.get("total_max")
    if total_max is not None:
        where_clauses.append("total_line <= %s")
        params.append(total_max)

    temp_min = filters.get("temp_min")
    if temp_min is not None:
        where_clauses.append("temp >= %s")
        params.append(temp_min)

    temp_max = filters.get("temp_max")
    if temp_max is not None:
        where_clauses.append("temp <= %s")
        params.append(temp_max)

    wind_min = filters.get("wind_min")
    if wind_min is not None:
        where_clauses.append("wind >= %s")
        params.append(wind_min)

    wind_max = filters.get("wind_max")
    if wind_max is not None:
        where_clauses.append("wind <= %s")
        params.append(wind_max)

    where_sql = " AND ".join(where_clauses)

    games_sql = f"""
        SELECT
            game_id,
            season,
            game_type,
            week,
            gameday,
            weekday,
            gametime,
            away_team,
            away_score,
            home_team,
            home_score,
            overtime,
            total_line,
            spread_line,
            div_game,
            roof,
            surface,
            temp,
            wind,
            away_qb_name,
            home_qb_name,
            away_coach,
            home_coach,
            stadium,
            (home_score > away_score) AS home_win,
            (home_score + away_score) AS total_points,
            CASE
                WHEN total_line IS NULL THEN NULL
                WHEN (home_score + away_score) > total_line THEN TRUE
                ELSE FALSE
            END AS over_hit,
            CASE
                WHEN spread_line IS NULL THEN NULL
                WHEN (home_score + spread_line) > away_score THEN 'HOME'
                WHEN (home_score + spread_line) < away_score THEN 'AWAY'
                ELSE 'PUSH'
            END AS spread_winner,
            (home_rest - away_rest) AS rest_diff,
            CASE
                WHEN spread_line IS NULL THEN NULL
                WHEN spread_line < 0 THEN TRUE
                ELSE FALSE
            END AS is_favorite_home
        FROM raw.nflverse_games
        WHERE {where_sql}
        ORDER BY season DESC, week DESC, gameday DESC;
    """

    summary_sql = f"""
        SELECT
            COUNT(*) AS game_count,
            AVG(home_score + away_score) AS avg_total,
            AVG(CASE WHEN home_score > away_score THEN 1 ELSE 0 END) AS home_win_pct,
            AVG(
                CASE
                    WHEN total_line IS NULL THEN NULL
                    WHEN (home_score + away_score) > total_line THEN 1
                    ELSE 0
                END
            ) AS over_pct
        FROM raw.nflverse_games
        WHERE {where_sql};
    """

    with connection.cursor() as cursor:
        cursor.execute(games_sql, params)
        rows = cursor.fetchall()
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in rows]

        cursor.execute(summary_sql, params)
        summary_row = cursor.fetchone()

    summary = {
        "game_count": summary_row[0] or 0,
        "avg_total": float(summary_row[1]) if summary_row[1] is not None else None,
        "home_win_pct": float(summary_row[2]) if summary_row[2] is not None else None,
        "over_pct": float(summary_row[3]) if summary_row[3] is not None else None,
    }

    return {"summary": summary, "results": results}


def fetch_team_codes(season):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT DISTINCT team_code
            FROM (
                SELECT home_team AS team_code
                FROM raw.nflverse_games
                WHERE season = %s
                UNION
                SELECT away_team AS team_code
                FROM raw.nflverse_games
                WHERE season = %s
            ) teams
            ORDER BY team_code;
            """,
            [season, season],
        )
        return [row[0] for row in cursor.fetchall()]


def fetch_team_roster(season, team_code):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                player_name,
                player_display_name,
                position,
                team,
                SUM(fantasy_points_ppr) AS fantasy_points_ppr
            FROM analytics.player_game_facts_ppr
            WHERE season = %s
              AND team = %s
              AND position IN ('QB', 'RB', 'WR', 'TE')
            GROUP BY player_name, player_display_name, position, team
            ORDER BY position, fantasy_points_ppr DESC, player_display_name;
            """,
            [season, team_code],
        )
        rows = cursor.fetchall()
        return [
            {
                "player_name": row[0],
                "player_display_name": row[1],
                "position": row[2],
                "team": row[3],
                "fantasy_points_ppr": float(row[4]) if row[4] is not None else 0.0,
            }
            for row in rows
        ]


def fetch_postseason_games(season):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                week,
                game_type,
                home_team,
                away_team,
                home_score,
                away_score
            FROM raw.nflverse_games
            WHERE season = %s
              AND (
                game_type = 'SB'
                OR game_type = 'CON'
              )
            ORDER BY week;
            """,
            [season],
        )
        rows = cursor.fetchall()
        return [
            {
                "week": row[0],
                "game_type": row[1],
                "home_team": row[2],
                "away_team": row[3],
                "home_score": row[4],
                "away_score": row[5],
            }
            for row in rows
        ]
