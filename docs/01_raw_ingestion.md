Raw CSV Ingestion into PostgreSQL (NFLverse Data)
Objective

The goal of this phase was to ingest large, real-world NFL datasets into PostgreSQL in a way that is:

Schema-safe

Repeatable

Source-faithful

Suitable for downstream analytics

Rather than manually curating columns or forcing CSVs into rigid schemas, the ingestion layer was designed to preserve raw data integrity and defer all transformations to SQL analytics views.

Data Sources

The project uses NFLverse open datasets:

player_stats.csv – player-level, game-level statistics

games.csv – official NFL game schedules and metadata

These datasets are:

Wide (50+ columns)

Evolving over time

Not curated for any single use case

This makes them ideal for demonstrating real-world data engineering patterns.

Why NOT PostgreSQL COPY directly?

Initial attempts to use COPY / \copy failed due to:

Strict column count matching in PostgreSQL

CSVs containing many more columns than required for analytics

Schema drift across seasons

Example error encountered:

ERROR: extra data after last expected column


This is expected PostgreSQL behavior and highlights a key principle:

Raw ingestion should be permissive; analytics should be strict.

Chosen Solution: pandas → PostgreSQL

The ingestion pipeline uses Python + pandas as a transport layer only.

Why pandas?

Reads arbitrary-width CSVs safely

Preserves column names exactly as provided

Automatically infers data types

Eliminates schema mismatch issues

Widely used in production analytics pipelines

Importantly:

pandas is not used for analytics or modeling, only for ingestion.

Ingestion Architecture
CSV Files
   ↓
pandas (read_csv)
   ↓
SQLAlchemy
   ↓
PostgreSQL (raw schema)

Ingestion Script Pattern

Example: scripts/load_nflverse_player_stats.py

import pandas as pd
from sqlalchemy import create_engine

CSV_PATH = "data/raw/player_stats.csv"

DB_URL = (
    "postgresql+psycopg2://"
    "nfl_user:<password>@10.0.0.4:5432/nfl_analytics_2025"
)

engine = create_engine(DB_URL)

df = pd.read_csv(CSV_PATH)

df.to_sql(
    "nflverse_player_game_stats",
    engine,
    schema="raw",
    if_exists="replace",
    index=False,
    method="multi",
    chunksize=10000,
)

Key design decisions
Decision	Rationale
raw schema	Explicit separation from analytics
if_exists=replace	Idempotent during development
No column renaming	Preserve source fidelity
No filtering	Avoid premature data loss
Resulting Raw Tables
raw.nflverse_player_game_stats
raw.nflverse_games


These tables:

Contain all available seasons

Include unused columns intentionally

Act as immutable source-of-truth inputs

Validation Queries
SELECT COUNT(*) FROM raw.nflverse_player_game_stats;

SELECT MIN(season), MAX(season)
FROM raw.nflverse_player_game_stats;


This confirms:

Successful ingestion

Multi-season coverage

No partial loads

Key Learning (Raw Ingestion)

Real analytics pipelines accept messy raw data and clean it downstream.

Trying to “perfect” data at ingestion time increases fragility and hides assumptions.