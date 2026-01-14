import pandas as pd
from sqlalchemy import create_engine

CSV_PATH = "data/raw/games.csv"

DB_URL = (
    "postgresql+psycopg2://"
    "nfl_user:nfl_user@10.0.0.4:5432/nfl_analytics_2025"
)

engine = create_engine(DB_URL)

print("Reading games.csv ...")
df = pd.read_csv(CSV_PATH)

print(f"Rows read: {len(df)}")
print("Writing to PostgreSQL: raw.nflverse_games")

df.to_sql(
    "nflverse_games",
    engine,
    schema="raw",
    if_exists="replace",
    index=False,
    method="multi",
    chunksize=10000,
)

print("Done loading games.")
