import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const backHref = from === "forecasting" ? "/forecasting" : "/teams";
  const backLabel = from === "forecasting" ? "Back to Forecast Explorer" : "Back to Teams";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(backHref);
  };

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

    const loadDetails = async () => {
      try {
        const response = await fetchPlayerDetails(
          season,
          decodedPlayer,
          team || undefined,
          position || undefined
        );
        setPlayerDetails(response);
      } catch (err) {
        if (team || position) {
          try {
            const fallback = await fetchPlayerDetails(season, decodedPlayer);
            setPlayerDetails(fallback);
            return;
          } catch (fallbackErr) {
            const message =
              fallbackErr instanceof Error ? fallbackErr.message : "Failed to load player details.";
            setDetailsError(message);
            return;
          }
        }
        const message = err instanceof Error ? err.message : "Failed to load player details.";
        setDetailsError(message);
      } finally {
        setDetailsLoading(false);
      }
    };

    loadDetails();
  }, [season, decodedPlayer, team, position]);

  return (
    <section className="section player-profile-page">
      <div className="section-header">
        <p className="section-eyebrow">Players</p>
        <h2>Player Profile</h2>
        <p>Seasonal splits and situational context, pulled from the forecast dataset.</p>
      </div>

      <Link
        className="back-link"
        to={backHref}
        onClick={(event) => {
          event.preventDefault();
          handleBack();
        }}
      >
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
