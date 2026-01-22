-- =====================================================
-- Cache: analytics.home_dashboard_cache
-- Purpose: Precompute homepage metrics for fast UI loads
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics.home_dashboard_cache (
    season INTEGER PRIMARY KEY,
    overview JSONB NOT NULL,
    metrics JSONB NOT NULL,
    metrics_by_position JSONB NOT NULL,
    weekly_mae JSONB NOT NULL,
    mvp JSONB NOT NULL,
    mvp_by_position JSONB NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION analytics.refresh_home_dashboard_cache(target_season INTEGER)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    min_season INTEGER;
    max_season INTEGER;
    total_games BIGINT;
    overview_json JSONB;
    metrics_json JSONB;
    metrics_by_position_json JSONB;
    weekly_mae_json JSONB;
    mvp_json JSONB;
    mvp_by_position_json JSONB;
BEGIN
    SELECT MIN(season), MAX(season), COUNT(*)
    INTO min_season, max_season, total_games
    FROM analytics.player_game_facts_ppr
    WHERE week BETWEEN 1 AND 18;

    overview_json := jsonb_build_object(
        'seasons', (
            SELECT jsonb_agg(season ORDER BY season)
            FROM (
                SELECT DISTINCT season
                FROM raw.nflverse_games
                WHERE season BETWEEN 2018 AND 2025
            ) AS seasons
        ),
        'total_player_games', total_games,
        'positions', jsonb_build_array('QB', 'RB', 'WR', 'TE')
    );

    metrics_json := jsonb_build_object(
        'mae', jsonb_build_object(
            'baseline', (
                SELECT AVG(abs_error)
                FROM analytics.player_week_backtest
                WHERE season = target_season AND week BETWEEN 1 AND 18
            ),
            'weighted', (
                SELECT CASE WHEN target_season = 2024 THEN AVG(abs_error) END
                FROM analytics.player_week_backtest_weighted_2024
                WHERE week BETWEEN 1 AND 18
            ),
            'enhanced', (
                SELECT AVG(ABS(a.ppr_points_calculated - f.forecast_ppr_points))
                FROM analytics.player_week_forecast_enhanced f
                JOIN analytics.player_game_facts_ppr a
                  ON f.player_id = a.player_id
                 AND f.season = a.season
                 AND f.forecast_week = a.week
                WHERE f.season = target_season
                  AND f.forecast_week BETWEEN 1 AND 18
                  AND a.week BETWEEN 1 AND 18
            )
        ),
        'bias', jsonb_build_object(
            'baseline', (
                SELECT AVG(error)
                FROM analytics.player_week_backtest
                WHERE season = target_season AND week BETWEEN 1 AND 18
            ),
            'weighted', (
                SELECT CASE WHEN target_season = 2024 THEN AVG(error) END
                FROM analytics.player_week_backtest_weighted_2024
                WHERE week BETWEEN 1 AND 18
            ),
            'enhanced', (
                SELECT AVG(a.ppr_points_calculated - f.forecast_ppr_points)
                FROM analytics.player_week_forecast_enhanced f
                JOIN analytics.player_game_facts_ppr a
                  ON f.player_id = a.player_id
                 AND f.season = a.season
                 AND f.forecast_week = a.week
                WHERE f.season = target_season
                  AND f.forecast_week BETWEEN 1 AND 18
                  AND a.week BETWEEN 1 AND 18
            )
        )
    );

    metrics_by_position_json := (
        SELECT jsonb_object_agg(position, jsonb_build_object('mae', mae))
        FROM (
            SELECT position, AVG(abs_error) AS mae
            FROM analytics.player_week_backtest
            WHERE season = target_season
              AND week BETWEEN 1 AND 18
            GROUP BY position
        ) AS stats
    );

    weekly_mae_json := (
        SELECT jsonb_agg(jsonb_build_object('week', week, 'mae', mae) ORDER BY week)
        FROM (
            SELECT
                week,
                AVG(abs_error) AS mae
            FROM analytics.player_week_backtest
            WHERE season = target_season
              AND week BETWEEN 1 AND 18
            GROUP BY week
            ORDER BY week
        ) AS stats
    );

    WITH season_totals AS (
        SELECT
            player_id,
            player_name,
            player_display_name,
            position,
            team AS recent_team,
            SUM(fantasy_points_ppr) AS fantasy_points_ppr
        FROM analytics.player_game_facts_ppr
        WHERE season = target_season
        GROUP BY player_id, player_name, player_display_name, position, team
    )
    SELECT jsonb_build_object(
        'season', target_season,
        'player_id', player_id,
        'player_name', player_name,
        'player_display_name', player_display_name,
        'position', position,
        'recent_team', recent_team,
        'fantasy_points_ppr', fantasy_points_ppr,
        'headshot_url', NULL
    )
    INTO mvp_json
    FROM season_totals
    ORDER BY fantasy_points_ppr DESC
    LIMIT 1;

    WITH season_totals AS (
        SELECT
            player_id,
            player_name,
            player_display_name,
            position,
            team AS recent_team,
            SUM(fantasy_points_ppr) AS fantasy_points_ppr
        FROM analytics.player_game_facts_ppr
        WHERE season = target_season
        GROUP BY player_id, player_name, player_display_name, position, team
    ),
    ranked AS (
        SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY position ORDER BY fantasy_points_ppr DESC) AS rn
        FROM season_totals
    )
    SELECT jsonb_object_agg(
        position,
        jsonb_build_object(
            'player_id', player_id,
            'player_name', player_name,
            'player_display_name', player_display_name,
            'position', position,
            'recent_team', recent_team,
            'fantasy_points_ppr', fantasy_points_ppr,
            'headshot_url', NULL
        )
    )
    INTO mvp_by_position_json
    FROM ranked
    WHERE rn = 1;

    INSERT INTO analytics.home_dashboard_cache (
        season,
        overview,
        metrics,
        metrics_by_position,
        weekly_mae,
        mvp,
        mvp_by_position,
        last_updated
    )
    VALUES (
        target_season,
        overview_json,
        metrics_json,
        COALESCE(metrics_by_position_json, '{}'::jsonb),
        COALESCE(weekly_mae_json, '[]'::jsonb),
        COALESCE(mvp_json, '{}'::jsonb),
        COALESCE(mvp_by_position_json, '{}'::jsonb),
        NOW()
    )
    ON CONFLICT (season)
    DO UPDATE SET
        overview = EXCLUDED.overview,
        metrics = EXCLUDED.metrics,
        metrics_by_position = EXCLUDED.metrics_by_position,
        weekly_mae = EXCLUDED.weekly_mae,
        mvp = EXCLUDED.mvp,
        mvp_by_position = EXCLUDED.mvp_by_position,
        last_updated = NOW();
END;
$$;
