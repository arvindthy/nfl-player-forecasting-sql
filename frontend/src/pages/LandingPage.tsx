import { useEffect, useState } from "react";
import { fetchOverview } from "@/lib/api";
import type { OverviewMetrics } from "@/types/overview";

export default function LandingPage() {
  const [data, setData] = useState<OverviewMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview()
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>Loading analytics…</p>;

  return (
    <section className="landing">
      <h1>NFL Fantasy Forecasting (PPR)</h1>

      <div className="metrics-grid">
        <div>
          <h3>Seasons</h3>
          <p>{data.seasons.join(", ")}</p>
        </div>

        <div>
          <h3>Total Player Games</h3>
          <p>{data.total_player_games}</p>
        </div>

        <div>
          <h3>Positions</h3>
          <p>{data.positions.join(", ")}</p>
        </div>
      </div>
    </section>
  );
}
