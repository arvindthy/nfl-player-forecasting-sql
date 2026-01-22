import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  fetchOverview,
  fetchMetrics,
  fetchMetricsByPosition,
  fetchMetricsByWeek,
  fetchMvp,
  fetchMvpByPosition,
  fetchPlayerDetails,
} from "@/lib/api";
import PlayerProfileCard from "@/components/PlayerProfileCard";
import "@/styles/forecast.css";
import type { OverviewMetrics } from "@/types/overview";
import type {
  MetricsResponse,
  MetricsByPositionResponse,
  WeeklyMaeResponse,
  MvpResponse,
  MvpByPositionResponse,
} from "@/types/metrics";
import type { PlayerDetailsResponse } from "@/types/forecast";

type FeaturedPlayerRecord = {
  playerName: string;
  playerDisplayName?: string;
  position?: string;
  team?: string;
};

const FEATURED_SEASON = 2024;

export default function LandingPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [metricsByPosition, setMetricsByPosition] =
    useState<MetricsByPositionResponse | null>(null);
  const [weeklyMae, setWeeklyMae] = useState<WeeklyMaeResponse | null>(null);
  const [mvp, setMvp] = useState<MvpResponse | null>(null);
  const [mvpsByPosition, setMvpsByPosition] = useState<MvpByPositionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [selectedPlayerModal, setSelectedPlayerModal] =
    useState<FeaturedPlayerRecord | null>(null);
  const [playerDetails, setPlayerDetails] = useState<PlayerDetailsResponse | null>(
    null
  );
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview()
      .then((data) => {
        setOverview(data);
        const season = data.seasons.includes(2024) ? 2024 : Math.max(...data.seasons);
        return Promise.all([
          fetchMetrics(season),
          fetchMetricsByPosition(season),
          fetchMetricsByWeek(season),
          fetchMvp(season),
          fetchMvpByPosition(season),
        ]);
      })
      .then(([metricsData, byPosition, weekly, mvpData, mvpByPositionData]) => {
        setMetrics(metricsData);
        setMetricsByPosition(byPosition);
        setWeeklyMae(weekly);
        setMvp(mvpData);
        setMvpsByPosition(mvpByPositionData);
        const lastWeek = weekly.weekly_mae[weekly.weekly_mae.length - 1]?.week;
        if (lastWeek) {
          setActiveWeek(lastWeek);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const toNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const positionBars = useMemo(() => {
    if (!metricsByPosition) return [];
    const entries = Object.entries(metricsByPosition.metrics || {});
    const max = Math.max(
      ...entries.map(([, v]) => toNumber(v.mae) ?? 0),
      1
    );
    return entries.map(([position, value]) => ({
      position,
      mae: toNumber(value.mae) ?? 0,
      width: ((toNumber(value.mae) ?? 0) / max) * 100,
    }));
  }, [metricsByPosition]);

  const weeklyChart = useMemo(() => {
    if (!weeklyMae?.weekly_mae?.length) {
      return [];
    }
    return weeklyMae.weekly_mae.map((point) => ({
      week: point.week,
      mae: toNumber(point.mae) ?? 0,
    }));
  }, [weeklyMae]);

  const latestSeason = useMemo(() => {
    if (!overview?.seasons?.length) return null;
    return overview.seasons.includes(2024) ? 2024 : Math.max(...overview.seasons);
  }, [overview]);

  const displaySeasons = useMemo(() => {
    if (!overview?.seasons?.length) return [];
    return overview.seasons.filter((season) => season <= 2024);
  }, [overview]);

  const lastUpdatedLabel = useMemo(() => {
    if (!overview?.last_updated) return null;
    const parsed = new Date(overview.last_updated);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, [overview?.last_updated]);

  const openPlayerModal = (
    entry?: MvpResponse | (MvpByPositionResponse["mvps"][string] | undefined)
  ) => {
    if (!entry) {
      return;
    }
    const displayName = entry.player_display_name ?? entry.player_name;
    if (!displayName) {
      return;
    }
    setSelectedPlayerModal({
      playerName: displayName,
      playerDisplayName: entry.player_display_name,
      position: entry.position,
      team: entry.recent_team,
    });
  };

  const handlePlayerKeyDown = (
    event: KeyboardEvent,
    player?: MvpResponse | (MvpByPositionResponse["mvps"][string] | undefined)
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPlayerModal(player);
    }
  };

  useEffect(() => {
    if (!selectedPlayerModal) {
      setPlayerDetails(null);
      setDetailsError(null);
      setDetailsLoading(false);
      return;
    }

    const playerName =
      selectedPlayerModal.playerDisplayName || selectedPlayerModal.playerName;
    if (!playerName) {
      setSelectedPlayerModal(null);
      return;
    }

    setPlayerDetails(null);
    setDetailsError(null);
    setDetailsLoading(true);

    const loadDetails = async () => {
      try {
        const response = await fetchPlayerDetails(
          FEATURED_SEASON,
          playerName,
          selectedPlayerModal.team,
          selectedPlayerModal.position
        );
        setPlayerDetails(response);
      } catch (err) {
        if (selectedPlayerModal.team || selectedPlayerModal.position) {
          try {
            const fallback = await fetchPlayerDetails(FEATURED_SEASON, playerName);
            setPlayerDetails(fallback);
            return;
          } catch (fallbackErr) {
            const message =
              fallbackErr instanceof Error
                ? fallbackErr.message
                : "Failed to load player details.";
            setDetailsError(message);
            return;
          }
        }
        const message =
          err instanceof Error ? err.message : "Failed to load player details.";
        setDetailsError(message);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadDetails();
  }, [selectedPlayerModal]);

  if (error) return <p className="error">Error: {error}</p>;
  if (!overview || !metrics || !metricsByPosition || !weeklyMae || !mvp || !mvpsByPosition) {
    return <p className="loading">Loading analytics…</p>;
  }

  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Main Landing Page</p>
        <h2>Home</h2>
        <p>Weekly fantasy insights built from play-level performance data.</p>
      </div>

      <div className="home-layout">
      <div className="home-hero">
        <div className="hero-tags">
          <p className="hero-tag">2024 Forecasting Engine</p>
          <span className="hero-subtag">2025 &amp; 2026 coming soon</span>
        </div>
        <h3>Actionable fantasy projections, built from real game tempo.</h3>
        <p>
          Track player outlooks, matchup context, and weekly fantasy trends with
          a focus on PPR impact.
        </p>
        <div className="hero-actions">
          <span>Live Data</span>
          <span>Weekly Updates</span>
          <span>Model-Driven</span>
          {lastUpdatedLabel && <span>Updated {lastUpdatedLabel}</span>}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Seasons Covered</h3>
          <p>{displaySeasons.join(", ")}</p>
        </div>

        <div className="metric-card">
          <h3>Total Player Games</h3>
          <p>{overview.total_player_games}</p>
        </div>

        <div className="metric-card">
          <h3>Positions Tracked</h3>
          <p>{overview.positions.join(" · ")}</p>
        </div>

        <div className="metric-card">
          <h3>Weeks Tracked</h3>
          <p>{weeklyMae.weekly_mae.length}</p>
        </div>

        <div className="metric-card highlight">
          <h3>MVP (All Positions)</h3>
          <div
            className="mvp-card clickable"
            role="button"
            tabIndex={0}
            onClick={() => openPlayerModal(mvp)}
            onKeyDown={(event) => handlePlayerKeyDown(event, mvp)}
          >
            {mvp.headshot_url && (
              <img src={mvp.headshot_url} alt={mvp.player_display_name || "MVP"} />
            )}
            <div>
              <p className="mvp-name">{mvp.player_display_name || mvp.player_name}</p>
              <p className="mvp-subtitle">
                {mvp.position} · {mvp.recent_team}
              </p>
              <p className="mvp-score">
                {toNumber(mvp.fantasy_points_ppr)?.toFixed(1) ?? "—"} PPR
              </p>
            </div>
          </div>
        </div>

        <div className="metric-card wide subtle">
          <h3>MVP by Position</h3>
          <div className="mvp-mini-grid">
              {["QB", "RB", "WR", "TE"].map((pos) => {
                const entry = mvpsByPosition.mvps[pos];
                const isClickable = Boolean(entry && (entry.player_display_name || entry.player_name));
                return (
                  <div
                    key={pos}
                    className={`mvp-mini-card${isClickable ? " clickable" : ""}`}
                    role={isClickable ? "button" : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={() => entry && openPlayerModal(entry)}
                    onKeyDown={(event) => entry && handlePlayerKeyDown(event, entry)}
                  >
                    {entry?.headshot_url && (
                      <img src={entry.headshot_url} alt={entry.player_display_name || entry.player_name || pos} />
                    )}
                    <div>
                      <span>{pos}</span>
                      <strong>{entry?.player_display_name || entry?.player_name || "—"}</strong>
                      <p>{entry?.recent_team || "—"}</p>
                      <p className="mvp-mini-score">
                        {toNumber(entry?.fantasy_points_ppr)?.toFixed(1) ?? "—"} PPR
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="home-analytics">
        <div className="analytics-card">
          <div className="card-header">
            <h3>Model Accuracy Pulse</h3>
            <p>Latest season MAE + bias compared across baselines.</p>
          </div>
          <div className="metric-grid">
            <div>
              <span>Baseline MAE</span>
              <strong>{toNumber(metrics.metrics.mae.baseline)?.toFixed(2) ?? "—"}</strong>
            </div>
            <div>
              <span>Weighted MAE</span>
              <strong>{toNumber(metrics.metrics.mae.weighted)?.toFixed(2) ?? "—"}</strong>
            </div>
            <div>
              <span>Enhanced MAE</span>
              <strong>{toNumber(metrics.metrics.mae.enhanced)?.toFixed(2) ?? "—"}</strong>
            </div>
            <div>
              <span>Baseline Bias</span>
              <strong>{toNumber(metrics.metrics.bias.baseline)?.toFixed(2) ?? "—"}</strong>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>MAE by Position</h3>
            <p>Position-level error signals for the latest season.</p>
          </div>
          <div className="bar-chart">
            {positionBars.map((bar) => (
              <div key={bar.position} className="bar-row">
                <span>{bar.position}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${bar.width}%` }} />
                </div>
                <strong>{bar.mae.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>Bias Snapshot</h3>
            <p>Shows whether each model tends to over- or under-predict.</p>
          </div>
          <div className="metric-grid">
            <div>
              <span>Weighted Bias</span>
              <strong>{toNumber(metrics.metrics.bias.weighted)?.toFixed(2) ?? "—"}</strong>
            </div>
            <div>
              <span>Enhanced Bias</span>
              <strong>{toNumber(metrics.metrics.bias.enhanced)?.toFixed(2) ?? "—"}</strong>
            </div>
            <div>
              <span>Season</span>
              <strong>{latestSeason}</strong>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <h3>How Our Forecast PPR Is Built</h3>
            <p>Position-specific formulas, simplified for quick scanning.</p>
          </div>
          <div className="forecast-blurb">
            <div className="formula-grid">
              <div className="formula-card base-card">
                <span>Base (All Positions)</span>
                <strong>
                  0.6 × PPR avg (last 3) + 0.3 × PPR avg (last 5) + 0.1 × PPR avg (last 8)
                </strong>
              </div>
              <div className="formula-card">
                <span>QB</span>
                <strong>
                  Base + 0.05 × pass attempts (last 3) + 0.10 × rush attempts (last 3)
                </strong>
              </div>
              <div className="formula-card">
                <span>RB</span>
                <strong>
                  Base + 0.15 × carries (last 3) + 0.20 × targets (last 3)
                </strong>
              </div>
              <div className="formula-card">
                <span>WR</span>
                <strong>
                  Base + 0.30 × targets (last 3)
                </strong>
              </div>
              <div className="formula-card">
                <span>TE</span>
                <strong>
                  Base + 0.25 × targets (last 3)
                </strong>
              </div>
            </div>
            <p className="forecast-note">
              Each term is calculated from recent games; the base score is shared, then position-specific usage adds lift.
            </p>
          </div>
        </div>

        <div className="analytics-card wide">
          <div className="card-header">
            <h3>Weekly MAE Trend</h3>
            <p>Hover a point to see exact week error.</p>
          </div>
          <div className="line-chart recharts-wrap">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid
                  stroke="rgba(var(--color-border-rgb), 0.15)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="week"
                  tickFormatter={(value) => `W${value}`}
                  stroke="rgba(var(--color-text-muted-rgb), 0.6)"
                  tick={{ fill: "rgba(var(--color-text-muted-rgb), 0.8)", fontSize: 12 }}
                />
                <YAxis
                  stroke="rgba(var(--color-text-muted-rgb), 0.6)"
                  tick={{ fill: "rgba(var(--color-text-muted-rgb), 0.8)", fontSize: 12 }}
                  domain={["auto", "auto"]}
                  tickFormatter={(value) => Number(value).toFixed(2)}
                />
                <Tooltip
                  formatter={(value) => `${Number(value).toFixed(2)} MAE`}
                  labelFormatter={(label) => `Week ${label}`}
                  contentStyle={{
                    background: "rgba(var(--color-surface-rgb), 0.9)",
                    border: "1px solid rgba(var(--color-border-rgb), 0.3)",
                    borderRadius: "10px",
                    color: "rgb(var(--color-text-rgb))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mae"
                  stroke="rgb(var(--color-accent-rgb))"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "rgb(var(--color-accent-rgb))" }}
                  activeDot={{ r: 6, fill: "rgb(var(--color-accent-2-rgb))" }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-tooltip">
              {activeWeek
                ? `Week ${activeWeek}: ${weeklyChart.find((p) => p.week === activeWeek)?.mae.toFixed(2)} MAE`
                : "Hover a point to inspect weekly MAE"}
            </div>
          </div>
        </div>
      </div>
    </div>
    {selectedPlayerModal && (
      <div className="modal-backdrop" onClick={() => setSelectedPlayerModal(null)}>
        <div className="player-modal" onClick={(event) => event.stopPropagation()}>
          <PlayerProfileCard
            selectedPlayer={
              selectedPlayerModal.playerDisplayName || selectedPlayerModal.playerName
            }
            position={selectedPlayerModal.position}
            season={FEATURED_SEASON}
            playerDetails={playerDetails}
            detailsLoading={detailsLoading}
            detailsError={detailsError}
            className="player-profile-card"
            headerAction={
              <button
                className="modal-close"
                type="button"
                onClick={() => setSelectedPlayerModal(null)}
              >
                ×
              </button>
            }
          />
        </div>
      </div>
    )}
    </section>
  );
}
