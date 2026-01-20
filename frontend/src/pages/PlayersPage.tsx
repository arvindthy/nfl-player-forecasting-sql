import { useEffect, useState } from "react";
import { fetchFilters, fetchForecasts } from "@/lib/api";
import type { FiltersResponse } from "@/types/filters";
import type { ForecastResponse } from "@/types/forecast";

export default function PlayersPage() {
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [season, setSeason] = useState<number | null>(null);
  const [week, setWeek] = useState<number | null>(null);
  const [position, setPosition] = useState<string>("QB");
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters()
      .then((data) => {
        setFilters(data);
        const latestSeason = data.seasons[data.seasons.length - 1];
        const latestWeek = data.weeks[data.weeks.length - 1];
        setSeason(latestSeason);
        setWeek(latestWeek);
        setPosition(data.positions[0] || "QB");
        return fetchForecasts(latestSeason, latestWeek, data.positions[0] || "QB");
      })
      .then(setForecast)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!season || !week || !position) return;
    fetchForecasts(season, week, position)
      .then(setForecast)
      .catch((err) => setError(err.message));
  }, [season, week, position]);

  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Players</p>
        <h2>Projection Leaderboard</h2>
        <p>Top projected players with live season/week filters.</p>
      </div>

      <div className="control-row">
        <label>
          Season
          <select
            value={season ?? ""}
            onChange={(event) => setSeason(Number(event.target.value))}
          >
            {filters?.seasons.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <label>
          Week
          <select
            value={week ?? ""}
            onChange={(event) => setWeek(Number(event.target.value))}
          >
            {filters?.weeks.map((value) => (
              <option key={value} value={value}>
                Week {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Position
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          >
            {filters?.positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error">Error: {error}</p>}
      {!forecast && !error && <p className="loading">Loading player leaderboard…</p>}

      {forecast && (
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Projected PPR</th>
              </tr>
            </thead>
            <tbody>
              {forecast.results.slice(0, 15).map((row, index) => (
                <tr key={`${row.player_name}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{row.player_name}</td>
                  <td>{row.team}</td>
                  <td>{Number(row.forecast_ppr_points).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
