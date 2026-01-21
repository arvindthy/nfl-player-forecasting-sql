import { useEffect, useMemo, useState } from "react";
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
} from "@/lib/api";
import type { OverviewMetrics } from "@/types/overview";
import type {
  MetricsResponse,
  MetricsByPositionResponse,
  WeeklyMaeResponse,
  MvpResponse,
  MvpByPositionResponse,
} from "@/types/metrics";

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

  useEffect(() => {
    fetchOverview()
      .then((data) => {
        setOverview(data);
        const season = Math.max(...data.seasons);
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
    return Math.max(...overview.seasons);
  }, [overview]);

  const latestWeekMae = useMemo(() => {
    if (!activeWeek) return null;
    const point = weeklyChart.find((entry) => entry.week === activeWeek);
    return point?.mae ?? null;
  }, [activeWeek, weeklyChart]);

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
        <p className="hero-tag">2024 Forecasting Engine</p>
        <h3>Actionable fantasy projections, built from real game tempo.</h3>
        <p>
          Track player outlooks, matchup context, and weekly fantasy trends with
          a focus on PPR impact.
        </p>
        <div className="hero-actions">
          <span>Live Data</span>
          <span>Weekly Updates</span>
          <span>Model-Driven</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Seasons Covered</h3>
          <p>{overview.seasons.join(", ")}</p>
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
          <div className="mvp-card">
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
              return (
                <div key={pos} className="mvp-mini-card">
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
            <h3>Latest Week MAE</h3>
            <p>Most recent weekly error check.</p>
          </div>
          <div className="metric-grid">
            <div>
              <span>Week</span>
              <strong>{activeWeek ?? "—"}</strong>
            </div>
            <div>
              <span>MAE</span>
              <strong>{latestWeekMae !== null ? latestWeekMae.toFixed(2) : "—"}</strong>
            </div>
            <div>
              <span>Season</span>
              <strong>{latestSeason}</strong>
            </div>
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
    </section>
  );
}
