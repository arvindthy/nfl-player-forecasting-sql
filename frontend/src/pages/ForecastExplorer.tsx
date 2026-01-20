import { useEffect, useState } from "react";
import { fetchFilters, fetchForecasts, fetchPlayerDetails } from "@/lib/api";
import type { ForecastResponse, PlayerDetailsResponse, PlayerDetailRecord } from "@/types/forecast";
import type { FiltersResponse } from "@/types/filters";
import { TEAM_LOGOS } from "@/lib/teamLogos";
import "@/styles/forecast.css";

export default function ForecastExplorer() {
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [season, setSeason] = useState<number | null>(null);
  const [week, setWeek] = useState<number | null>(null);
  const [position, setPosition] = useState<string>("QB");

  const [data, setData] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerDetails, setPlayerDetails] = useState<PlayerDetailsResponse | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchFilters()
      .then((data) => {
        setFilters(data);
        const seasons = data.seasons;
        const latestSeason = seasons[seasons.length - 1];
        const latestWeek = data.weeks[data.weeks.length - 1];
        const defaultPosition = data.positions[0] || "QB";
        setSeason(latestSeason);
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

  const openPlayerModal = (playerName: string, team?: string, pos?: string) => {
    setSelectedPlayer(playerName);
    setPlayerDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    if (!season) {
      setDetailsLoading(false);
      return;
    }

    fetchPlayerDetails(season, playerName, team, pos)
      .then(setPlayerDetails)
      .catch(err => setDetailsError(err.message))
      .finally(() => setDetailsLoading(false));
  };

  const closePlayerModal = () => {
    setSelectedPlayer(null);
    setPlayerDetails(null);
    setDetailsError(null);
    setDetailsLoading(false);
  };

  const getLogo = (team?: string) => (team ? TEAM_LOGOS[team] : undefined);

  const formatStat = (key: string, value?: string) => {
    if (value === undefined || value === null || value === "") {
      return null;
    }
    const roundedKeys = new Set(["passing_epa", "rushing_epa", "passing_cpoe"]);
    if (roundedKeys.has(key)) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed.toFixed(2) : value;
    }
    return value;
  };

  const renderStatGroup = (record: PlayerDetailRecord, title: string, keys: Array<[string, string]>) => {
    const entries = keys
      .map(([label, key]) => [label, formatStat(key, record[key])] as const)
      .filter(([, value]) => value !== null);

    if (!entries.length) {
      return null;
    }

    return (
      <div className="stat-group">
        <h4>{title}</h4>
        <div className="stat-grid">
          {entries.map(([label, value]) => (
            <div className="stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    );
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
            Projected PPR fantasy points, tuned by recent performance and
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
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Forecast PPR</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row, i) => (
                <tr
                  key={i}
                  onClick={() => openPlayerModal(row.player_name, row.team, position)}
                  className="clickable-row"
                >
                  <td>{i + 1}</td>
                  <td>{row.player_name}</td>
                  <td>{row.team}</td>
                  <td>{Number(row.forecast_ppr_points).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.results.length === 0 && (
        <p className="error">No forecasts available for this week yet. Try a later week.</p>
      )}

      {selectedPlayer && (
        <div className="modal-backdrop" onClick={closePlayerModal}>
          <div className="modal-card" onClick={event => event.stopPropagation()}>
            <button className="modal-close" onClick={closePlayerModal} aria-label="Close">
              ×
            </button>
            <div className="modal-header">
              {playerDetails?.records?.[0]?.headshot_url && (
                <img
                  src={playerDetails.records[0].headshot_url}
                  alt={selectedPlayer}
                  className="player-headshot"
                />
              )}
              <div>
                <p className="modal-eyebrow">Player Profile</p>
                <h2>{playerDetails?.records?.[0]?.player_display_name || selectedPlayer}</h2>
                <p className="modal-subtitle">
                  {playerDetails?.records?.[0]?.position || position}
                  {playerDetails?.records?.[0]?.recent_team ? ` · ${playerDetails.records[0].recent_team}` : ""}
                </p>
              </div>
            </div>

            {detailsLoading && <p className="loading">Loading player details…</p>}
            {detailsError && <p className="error">Error: {detailsError}</p>}

            {playerDetails && (
              <div className="modal-body">
                {playerDetails.records.map((record, index) => (
                  <section key={`${record.season_type}-${index}`} className="record-card">
                    <div className="record-header">
                      <div>
                        <h3>{record.season_type || "REG"}</h3>
                        <p>
                          Season {record.season || season}
                          {record.games ? ` · Games: ${record.games}` : ""}
                        </p>
                      </div>
                      <span className="record-team">
                        {getLogo(record.recent_team) ? (
                          <img
                            className="record-team-logo"
                            src={getLogo(record.recent_team)}
                            alt={`${record.recent_team} logo`}
                            loading="lazy"
                          />
                        ) : (
                          record.recent_team || "—"
                        )}
                      </span>
                    </div>
                    {renderStatGroup(record, "Passing", [
                      ["Completions", "completions"],
                      ["Attempts", "attempts"],
                      ["Pass Yards", "passing_yards"],
                      ["Pass TDs", "passing_tds"],
                      ["INT", "passing_interceptions"],
                      ["Air Yards", "passing_air_yards"],
                      ["YAC", "passing_yards_after_catch"],
                      ["Pass EPA", "passing_epa"],
                      ["CPOE", "passing_cpoe"],
                    ])}
                    {renderStatGroup(record, "Rushing", [
                      ["Carries", "carries"],
                      ["Rush Yards", "rushing_yards"],
                      ["Rush TDs", "rushing_tds"],
                      ["Rush FD", "rushing_first_downs"],
                      ["Rush EPA", "rushing_epa"],
                    ])}
                    {renderStatGroup(record, "Receiving", [
                      ["Targets", "targets"],
                      ["Receptions", "receptions"],
                      ["Rec Yards", "receiving_yards"],
                      ["Rec TDs", "receiving_tds"],
                      ["Rec FD", "receiving_first_downs"],
                      ["Rec EPA", "receiving_epa"],
                    ])}
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
