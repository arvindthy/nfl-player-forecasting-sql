import pandas as pd
from pathlib import Path
from sqlalchemy import create_engine

BASE_DIR = Path(__file__).resolve().parents[1]
CSV_PATH = BASE_DIR / "backend" / "data" / "raw" / "player_stats.csv"

DB_URL = (
    "postgresql+psycopg2://"
    "nfl_user:nfl_user@10.0.0.4:5432/nfl_analytics_2025"
)

engine = create_engine(DB_URL)

print("Reading player_stats.csv ...")
df = pd.read_csv(CSV_PATH)

print(f"Rows read: {len(df)}")
print("Writing to PostgreSQL: raw.nflverse_player_game_stats")

with engine.begin() as conn:
    conn.exec_driver_sql("TRUNCATE TABLE raw.nflverse_player_game_stats")

df.to_sql(
    "nflverse_player_game_stats",
    engine,
    schema="raw",
    if_exists="append",
    index=False,
    method="multi",
    chunksize=10000,
)

print("Done loading player stats.")
