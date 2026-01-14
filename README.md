🏈 NFL Fantasy Player Forecasting with SQL Analytics

Author: Arvind Thyagarajan
Tech Stack: PostgreSQL · SQL Analytics · Python · Django · (Planned: React)

📌 Project Overview

This project is an end-to-end NFL fantasy football forecasting system built to showcase:

Advanced SQL analytics in PostgreSQL

Real-world data ingestion and modeling

Explainable, non-black-box forecasting logic

Proper out-of-sample evaluation on unseen seasons

Clean separation between data, analytics, and application layers

The core objective is not just to “predict fantasy points,” but to demonstrate how production-style analytical pipelines are designed, evaluated, and presented.

🎯 Problem Statement

Fantasy football forecasting is inherently noisy:

Player usage changes week to week

Injuries, game scripts, and coaching decisions introduce volatility

Early-season data is sparse and misleading

Rather than relying on opaque machine-learning models, this project explores how far one can go using:

Carefully designed SQL feature engineering + domain-aware logic

…and how to measure when and why predictions fail.

📊 Data Sources

The project uses real NFL data from the NFLverse open datasets:

Player-level, game-level statistics

Official NFL schedules and metadata

Coverage:

Seasons: 2018 – 2024

Positions: QB, RB, WR, TE

Granularity: Player × Game

All raw data is ingested as-is to preserve source fidelity.

🗄️ Data Architecture

The PostgreSQL database is intentionally structured using schema separation, mirroring real analytics systems:

raw        → immutable source data (CSV ingestion)
analytics  → facts, features, forecasts, evaluation
public     → Django application tables


This ensures:

No analytics logic pollutes raw data

All transformations are explicit and auditable

Forecasting logic is fully reproducible

🔁 Raw Data Ingestion

Raw CSV files are ingested using Python + pandas as a transport layer:

Handles wide, evolving schemas safely

Avoids fragile COPY assumptions

Preserves all original columns

Key principle:

Raw ingestion is permissive; analytics are strict.

No filtering or modeling occurs during ingestion.

🧮 Fantasy Scoring (PPR)

Fantasy scoring is recomputed in SQL, not trusted from source files.

Standard PPR rules are applied explicitly, including:

Passing yards, TDs, interceptions

Rushing yards, TDs

Receptions and receiving yards

This makes scoring:

Auditable

Explainable

Easy to adapt to other scoring systems

🧠 Feature Engineering (SQL)

All feature engineering is implemented using PostgreSQL window functions, including:

Performance Features

Last-3-game PPR average

Last-5-game PPR average

Season-to-date PPR average

Usage Features

Rolling targets (WR/TE)

Rolling rushing attempts (RB)

Rolling touches (QB/RB)

These features form a unified SQL feature layer, used by all forecasting logic.

📈 Forecasting Strategy

Forecasts are generated for Week N+1 using data available through Week N, preventing data leakage.

Position-Specific Weighting

Different positions exhibit different volatility patterns:

QBs → form-driven, high variance

RBs → workload-driven

WRs → role & target share driven

TEs → slower, stability-driven

Forecast logic applies position-aware weights to rolling features, significantly improving stability.

Enhanced Forecast Model

The final forecast combines:

Rolling PPR performance

Rolling usage signals

Position-specific weighting

All logic remains transparent SQL—no black boxes.

🧪 Model Evaluation & Backtesting
Train / Test Split

Training: 2018–2023

Evaluation: 2024 (unseen season)

This provides a true out-of-sample test, mirroring real forecasting conditions.

Evaluation Metrics (SQL)

Mean Absolute Error (MAE)

Bias (over- vs under-prediction)

Position-level accuracy

Weekly stability analysis

Outlier inspection

Multiple model variants (baseline → weighted → enhanced) are compared directly in SQL.

🔍 Key Learnings

Rolling averages alone struggle with early-season usage shocks

Usage signals materially improve WR/RB forecasts

Some NFL outcomes are inherently unpredictable (boom/bust weeks)

Directional accuracy and tier correctness matter more than exact points

Most importantly:

Complex, explainable forecasting systems can be built and evaluated entirely in SQL when the data model is designed well.

🧰 Tooling & Application Layer

PostgreSQL: Core analytics engine

Python: Data ingestion & automation

Django: Application foundation + admin interface

Django is intentionally kept logic-light:

SQL remains the single source of truth

Django will expose read-only analytics APIs

🌐 Planned Enhancements

Django REST API for analytics views

React dashboard to visualize:

Forecasts by week/position

Actual vs predicted comparisons

Model accuracy metrics

Public demo suitable for portfolio & LinkedIn showcase

📎 Repository Structure
nfl-player-forecasting-sql/
├── scripts/        # ingestion & automation
├── sql/
│   └── views/      # versioned analytics SQL
├── docs/           # technical notes & learnings
├── .gitignore
└── README.md

🚀 Why This Project Matters

This project demonstrates:

Real data handling (not toy datasets)

Strong SQL analytics and window functions

Proper forecasting evaluation discipline

End-to-end system thinking (DB → API → UI)

It is designed to be read, reasoned about, and extended—not just run.