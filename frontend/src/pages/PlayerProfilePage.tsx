import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchFilters, fetchPlayerDetails } from "@/lib/api";
import PlayerProfileCard from "@/components/PlayerProfileCard";
import type { FiltersResponse } from "@/types/filters";
import type { PlayerDetailsResponse } from "@/types/forecast";
import "@/styles/forecast.css";

export default function PlayerProfilePage() {
  const { playerId } = useParams();
  const [searchParams] = useSearchParams();
  const [season, setSeason] = useState<number | null>(null);
  const [playerDetails, setPlayerDetails] = useState<PlayerDetailsResponse | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const decodedPlayer = playerId ? decodeURIComponent(playerId) : "";
  const team = searchParams.get("team") || undefined;
  const position = searchParams.get("position") || undefined;
  const from = searchParams.get("from");
  const backHref = from === "forecasting" ? "/forecasting" : "/teams";
  const backLabel = from === "forecasting" ? "Back to Forecast Explorer" : "Back to Teams";

  useEffect(() => {
    const seasonParam = searchParams.get("season");
    if (seasonParam) {
      setSeason(Number(seasonParam));
      return;
    }

    fetchFilters()
      .then((data: FiltersResponse) => {
        const latestSeason = data.seasons[data.seasons.length - 1];
        setSeason(latestSeason);
      })
      .catch((err) => setDetailsError(err.message));
  }, [searchParams]);

  useEffect(() => {
    if (!season || !decodedPlayer) return;
    setDetailsLoading(true);
    setDetailsError(null);

    fetchPlayerDetails(season, decodedPlayer, team || undefined, position || undefined)
      .then(setPlayerDetails)
      .catch((err) => setDetailsError(err.message))
      .finally(() => setDetailsLoading(false));
  }, [season, decodedPlayer, team, position]);

  return (
    <section className="section player-profile-page">
      <div className="section-header">
        <p className="section-eyebrow">Players</p>
        <h2>Player Profile</h2>
        <p>Seasonal splits and situational context, pulled from the forecast dataset.</p>
      </div>

      <Link className="back-link" to={backHref}>
        ← {backLabel}
      </Link>

      <PlayerProfileCard
        selectedPlayer={decodedPlayer}
        position={position}
        season={season}
        playerDetails={playerDetails}
        detailsLoading={detailsLoading}
        detailsError={detailsError}
        className="player-profile-card"
      />
    </section>
  );
}
