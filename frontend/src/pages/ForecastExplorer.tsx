import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFilters, fetchForecasts } from "@/lib/api";
import type { ForecastResponse } from "@/types/forecast";
import type { FiltersResponse } from "@/types/filters";
import "@/styles/forecast.css";

export default function ForecastExplorer() {
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [season, setSeason] = useState<number | null>(2024);
  const [week, setWeek] = useState<number | null>(null);
  const [position, setPosition] = useState<string>("QB");

  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFilters()
      .then((data) => {
        setFilters(data);
        const seasons = data.seasons;
        const latestSeason = seasons[seasons.length - 1];
        const latestWeek = data.weeks[data.weeks.length - 1];
        const defaultPosition = data.positions[0] || "QB";
        setSeason(seasons.includes(2024) ? 2024 : latestSeason);
        setWeek(latestWeek);
        setPosition(defaultPosition);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!season || !week || !position) {
      return;
    }
    setData(null);
    setError(null);

    fetchForecasts(season, week, position)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [season, week, position]);

  const openPlayerProfile = (playerName: string, team?: string, pos?: string) => {
    if (!season) return;
    const params = new URLSearchParams();
    params.set("season", season.toString());
    if (team) params.set("team", team);
    if (pos) params.set("position", pos);
    params.set("from", "forecasting");
    const path = `/players/${encodeURIComponent(playerName)}?${params.toString()}`;
    navigate(path);
  };

  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Forecasting</p>
        <h2>Projections & Explorer</h2>
        <p>Filter by season, week, and position to surface top projected performers.</p>
      </div>
      <div className="forecast-page">
      <header className="forecast-hero">
        <div className="hero-content">
          <p className="hero-eyebrow">NFL Forecast Lab</p>
          <h1>Forecast Explorer</h1>
          <p className="subtitle hero-subtitle">
            PPR fantasy points, tuned by recent performance and
            matchup context.
          </p>
          <div className="hero-chips">
            <span className="chip">Season {season}</span>
            <span className="chip">Week {week}</span>
            <span className="chip">{position} focus</span>
          </div>
        </div>

        <div className="hero-card">
          <p className="hero-card-title">Live Snapshot</p>
          <div className="hero-card-body">
            <div className="metric">
              <span>Position</span>
              <strong>{position}</strong>
            </div>
            <div className="metric">
              <span>Week</span>
              <strong>{week}</strong>
            </div>
            <div className="metric">
              <span>Season</span>
              <strong>{season}</strong>
            </div>
            <div className="metric">
              <span>Results</span>
              <strong>{data ? data.results.length : "—"}</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="filters-panel">
        <div className="filters">
          <label>
            Season
            <select
              value={season ?? ""}
              onChange={(e) => setSeason(Number(e.target.value))}
            >
              {filters?.seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            Week
            <select
              value={week ?? ""}
              onChange={(e) => setWeek(Number(e.target.value))}
            >
              {(filters?.weeks ?? []).map((w) => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          </label>

          <label>
            Position
            <select value={position} onChange={(e) => setPosition(e.target.value)}>
              {filters?.positions.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* States */}
      {error && <p className="error">Error: {error}</p>}
      {!data && !error && <p className="loading">Loading forecasts…</p>}

      {/* Table */}
      {data && data.results.length > 0 && (
        <div className="table-card">
          <table className="forecast-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Actual PPR</th>
                <th>Forecast PPR</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => openPlayerProfile(row.player_name, row.team, position)}
                  className="clickable-row"
                >
                  <td>{i + 1}</td>
                  <td>{row.player_name}</td>
                  <td>{row.team}</td>
                  <td>
                    {row.actual_ppr_points != null
                      ? Number(row.actual_ppr_points).toFixed(2)
                      : "—"}
                  </td>
                  <td>{Number(row.forecast_ppr_points).toFixed(2)}</td>
                  <td>
                    {row.actual_ppr_points != null
                      ? `${Number(row.forecast_ppr_points) - Number(row.actual_ppr_points) >= 0 ? "+" : ""}${(
                          Number(row.forecast_ppr_points) - Number(row.actual_ppr_points)
                        ).toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.results.length === 0 && (
        <p className="error">No forecasts available for this week yet. Try a later week.</p>
      )}

      </div>
    </section>
  );
}
