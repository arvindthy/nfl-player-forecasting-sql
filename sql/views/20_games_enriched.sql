-- =====================================================
-- View: analytics.games_enriched
-- Purpose: Enriched games dataset for dashboard filters
-- Author: Arvind Thyagarajan
-- =====================================================

CREATE OR REPLACE VIEW analytics.games_enriched AS
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
    location,
    result,
    total,
    overtime,
    spread_line,
    total_line,
    div_game,
    roof,
    surface,
    temp,
    wind,
    away_qb_id,
    home_qb_id,
    away_qb_name,
    home_qb_name,
    away_coach,
    home_coach,
    referee,
    stadium_id,
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
WHERE season BETWEEN 2018 AND 2024
  AND game_type = 'REG'
  AND week BETWEEN 1 AND 18;
