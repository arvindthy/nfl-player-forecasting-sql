SQL Analytics & Forecasting in PostgreSQL
Objective

The analytics layer transforms raw NFL data into:

Clean, queryable fact views

Explicit fantasy scoring logic

Rolling feature engineering

Explainable forecasting outputs

Measurable evaluation metrics

All analytics are implemented directly in PostgreSQL SQL, without external modeling tools.

Schema Design

The database uses schema separation to enforce clarity:

Schema	Purpose
raw	Source data (immutable)
analytics	Derived facts, features, forecasts
public	Django application tables

This mirrors professional data warehouse design.

Core Analytics Views
1️⃣ Player–Game Fact View
analytics.player_game_facts


Purpose:

One row per player per game

Filtered to skill positions (QB, RB, WR, TE)

Seasons limited to 2018–2024

Joined with game context (home/away)

This view normalizes raw vendor schemas into domain-friendly columns.

2️⃣ PPR Fantasy Scoring (Explicit)
analytics.player_game_facts_ppr


Fantasy scoring is recomputed, not trusted from source data.

Standard PPR rules applied:

Passing yards, TDs, interceptions

Rushing yards, TDs

Receptions, receiving yards, TDs

Why this matters:

Explicit scoring logic is auditable, explainable, and defensible.

3️⃣ Rolling Feature Engineering
analytics.player_game_features_v2


This view computes rolling features using SQL window functions:

Last 3 games PPR average

Last 5 games PPR average

Season-to-date average

Rolling usage features:

targets (WR/TE)

rushing attempts (RB)

touches (QB/RB)

Example pattern:

AVG(ppr_points_calculated)
OVER (
  PARTITION BY player_id
  ORDER BY season, week
  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
)


These features form the model input layer.

Forecasting Strategy
Baseline Forecasting

Forecasts are made for week N+1 using data available through week N.

This avoids data leakage and mirrors real-world forecasting constraints.

Position-Specific Weighting

Different positions exhibit different volatility patterns.

Weights were tuned accordingly:

Position	Recent Form	Medium	Season
QB	High	Medium	Low
RB	Medium	Medium	Medium
WR	Medium	Medium	Medium
TE	Low	Medium	High

This significantly improved forecast stability.

Enhanced Forecast View
analytics.player_week_forecast_enhanced


Combines:

Rolling PPR features

Usage signals

Position-aware weighting

All logic remains transparent SQL.

Model Evaluation & Backtesting
Holdout Strategy

Training: 2018–2023

Evaluation: 2024 (unseen season)

This ensures true out-of-sample testing.

Backtest View
analytics.player_week_backtest_2024


Captures:

Predicted PPR

Actual PPR

Error

Absolute error

Evaluation Metrics

Computed directly in SQL:

Mean Absolute Error (MAE)

Bias

Accuracy by position

Weekly stability

Outlier analysis

This allows:

Quantitative comparison between baseline, weighted, and enhanced models.

Key Learning (SQL Analytics)

Complex analytical models can be built, evaluated, and explained entirely in SQL when the data model is well designed.

This approach:

Scales well

Is auditable

Avoids black-box behavior

Transfers across industries

Final Outcome

At the end of this phase, the system supports:

Real NFL data ingestion

Clean analytical views

Explainable forecasting

Measured out-of-sample accuracy

Clear extension paths (UI, API, ML)