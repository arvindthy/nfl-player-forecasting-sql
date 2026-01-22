import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { fetchFilters, fetchTeamRoster, fetchTeams } from "@/lib/api";
import type { FiltersResponse } from "@/types/filters";
import type { TeamRosterPlayer, TeamRosterResponse, TeamSummary } from "@/types/teams";
import { TEAM_LOGOS } from "@/lib/teamLogos";

const POSITION_ORDER = ["QB", "RB", "WR", "TE"];

const groupByPosition = (players: TeamRosterPlayer[]) => {
  const grouped = new Map<string, TeamRosterPlayer[]>();
  POSITION_ORDER.forEach((pos) => grouped.set(pos, []));
  players.forEach((player) => {
    const list = grouped.get(player.position);
    if (list) list.push(player);
  });
  return grouped;
};

export default function TeamDashboard() {
  const { teamCode } = useParams();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [season, setSeason] = useState<number | null>(2024);
  const [team, setTeam] = useState<TeamSummary | null>(null);
  const [roster, setRoster] = useState<TeamRosterPlayer[]>([]);
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const seasonParam = searchParams.get("season");
    const hasSeasonParam = Boolean(seasonParam);
    if (seasonParam) {
      const parsed = Number(seasonParam);
      if (Number.isFinite(parsed)) {
        setSeason(parsed);
      }
    }
    fetchFilters()
      .then((data) => {
        setFilters(data);
        if (!hasSeasonParam) {
          const latestSeason = data.seasons[data.seasons.length - 1];
          setSeason(latestSeason);
        }
      })
      .catch((err) => setError(err.message));
  }, [searchParams]);

  useEffect(() => {
    if (!season) return;
    fetchTeams(season)
      .then((data) => {
        const match = data.teams.find(
          (entry: TeamSummary) =>
            entry.code.toUpperCase() === (teamCode || "").toUpperCase()
        );
        setTeam(match || null);
      })
      .catch((err) => setError(err.message));
  }, [teamCode, season]);

  useEffect(() => {
    if (!season || !teamCode) return;
    fetchTeamRoster(season, teamCode.toUpperCase())
      .then((data: TeamRosterResponse) => setRoster(data.roster))
      .catch((err) => setError(err.message));
  }, [season, teamCode]);

  const filteredRoster = useMemo(() => {
    if (positionFilter === "ALL") return roster;
    return roster.filter((player) => player.position === positionFilter);
  }, [positionFilter, roster]);

  const groupedRoster = useMemo(
    () => groupByPosition(filteredRoster),
    [filteredRoster]
  );

  const teamName = team ? team.name : teamCode?.toUpperCase() || "Team";
  const conferenceLabel = team
    ? `${team.conference} · ${team.division}`
    : "Conference · Division";

  return (
    <section className="section team-dashboard">
      <div className="section-header">
        <p className="section-eyebrow">Teams</p>
        <h2>{teamName} Command Center</h2>
        <p>Roles, starters, and fantasy priorities for the current season.</p>
      </div>

      <Link className="back-link" to="/teams">
        ← Back to Teams
      </Link>

      <div className="team-header-card">
        <div className="team-header-main">
          <div className="team-logo-wrap large">
            {team?.code && TEAM_LOGOS[team.code] && (
              <img
                src={TEAM_LOGOS[team.code]}
                alt={`${teamName} logo`}
                loading="lazy"
              />
            )}
          </div>
          <div>
            <p>{conferenceLabel}</p>
            <h3>{teamName}</h3>
            <p className="subtitle">
              {team?.description || "Fantasy usage map for this roster."}
            </p>
          </div>
        </div>
        <label className="season-picker">
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
      </div>

      <div className="position-filters">
        <button
          type="button"
          className={positionFilter === "ALL" ? "active" : ""}
          onClick={() => setPositionFilter("ALL")}
        >
          All
        </button>
        {POSITION_ORDER.map((pos) => (
          <button
            key={pos}
            type="button"
            className={positionFilter === pos ? "active" : ""}
            onClick={() => setPositionFilter(pos)}
          >
            {pos}
          </button>
        ))}
      </div>

      {error && <p className="error">Error: {error}</p>}
      {!roster.length && !error && <p className="loading">Loading roster…</p>}

      <div className="team-roster">
        {POSITION_ORDER.map((pos) => {
          const players = groupedRoster.get(pos) || [];
          if (!players.length) return null;
          return (
            <section key={pos} className="team-roster-group">
              <div className="team-roster-header">
                <h4>{pos}</h4>
                <span>{players.length} players</span>
              </div>
              <div className="team-roster-list">
                {players.map((player) => {
                  const params = new URLSearchParams();
                  if (season) params.set("season", season.toString());
                  params.set("team", player.team);
                  params.set("position", player.position);
                  const query = params.toString();
                  const profilePath = `/players/${encodeURIComponent(player.player_display_name)}${query ? `?${query}` : ""}`;

                  return (
                  <Link
                    key={`${player.player_display_name}-${player.position}`}
                    to={profilePath}
                    className="player-row"
                  >
                    <div>
                      <strong>{player.player_display_name}</strong>
                      <span>{player.position} · {player.team}</span>
                    </div>
                    <div className="player-row-meta">
                      <span>{player.role_hint}</span>
                      <span className="rank-chip">#{player.rank_in_position}</span>
                    </div>
                  </Link>
                );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
