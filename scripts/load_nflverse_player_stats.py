import pandas as pd
from sqlalchemy import create_engine

CSV_PATH = "data/raw/player_stats.csv"

DB_URL = (
    "postgresql+psycopg2://"
    "nfl_user:nfl_user@10.0.0.4:5432/nfl_analytics_2025"
)

engine = create_engine(DB_URL)

print("Reading player_stats.csv ...")
df = pd.read_csv(CSV_PATH)

print(f"Rows read: {len(df)}")
print("Writing to PostgreSQL: raw.nflverse_player_game_stats")

df.to_sql(
    "nflverse_player_game_stats",
    engine,
    schema="raw",
    if_exists="replace",   # safe for re-runs during setup
    index=False,
    method="multi",
    chunksize=10000,
)

print("Done loading player stats.")
