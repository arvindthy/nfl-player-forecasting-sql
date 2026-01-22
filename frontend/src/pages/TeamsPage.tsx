import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFilters, fetchGames, fetchTeams } from "@/lib/api";
import type { FiltersResponse } from "@/types/filters";
import type { GamesResponse } from "@/types/games";
import type { TeamSummary, TeamsResponse } from "@/types/teams";
import { TEAM_LOGOS } from "@/lib/teamLogos";

type TeamMetrics = {
  avgScored: number | null;
  avgAllowed: number | null;
  games: number;
};

const SEASONS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const formatValue = (value: number | null) =>
  value === null ? "—" : value.toFixed(1);

const DIVISION_ORDER = [
  "AFC North",
  "AFC East",
  "AFC South",
  "AFC West",
  "NFC North",
  "NFC East",
  "NFC South",
  "NFC West",
];

export default function TeamsPage() {
  const [filters, setFilters] = useState<FiltersResponse | null>(null);
  const [season, setSeason] = useState<number | null>(2024);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [honors, setHonors] = useState<TeamsResponse["honors"] | null>(null);
  const [games, setGames] = useState<GamesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFilters()
      .then((data) => {
        setFilters(data);
        const mergedSeasons = Array.from(
          new Set([...(data.seasons ?? []), ...SEASONS])
        ).sort((a, b) => a - b);
        const latestSeason = mergedSeasons[mergedSeasons.length - 1];
		// Set the season to 2024 if available, else latest
        setSeason(mergedSeasons.includes(2024) ? 2024 : latestSeason);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!season) return;
    fetchTeams(season)
      .then((data: TeamsResponse) => {
        setTeams(data.teams);
        setHonors(data.honors ?? null);
      })
      .catch((err) => setError(err.message));
    fetchGames({ season: season.toString() })
      .then((data: GamesResponse) => setGames(data))
      .catch((err) => setError(err.message));
  }, [season]);

  const teamMetrics = useMemo(() => {
    const metrics = new Map<string, TeamMetrics>();
    teams.forEach((team) => {
      metrics.set(team.code, {
        avgScored: null,
        avgAllowed: null,
        games: 0,
      });
    });

    if (!games) return metrics;

    const totals = new Map<
      string,
      { scored: number; allowed: number; games: number }
    >();

    games.results.forEach((game) => {
      if (
        game.home_score === null ||
        game.away_score === null ||
        Number.isNaN(game.home_score) ||
        Number.isNaN(game.away_score)
      ) {
        return;
      }

      const update = (team: string, scored: number, allowed: number) => {
        const current = totals.get(team) || { scored: 0, allowed: 0, games: 0 };
        totals.set(team, {
          scored: current.scored + scored,
          allowed: current.allowed + allowed,
          games: current.games + 1,
        });
      };

      update(game.home_team, game.home_score, game.away_score);
      update(game.away_team, game.away_score, game.home_score);
    });

    totals.forEach((value, teamCode) => {
      const avgScored = value.games ? value.scored / value.games : null;
      const avgAllowed = value.games ? value.allowed / value.games : null;
      metrics.set(teamCode, {
        avgScored,
        avgAllowed,
        games: value.games,
      });
    });

    return metrics;
  }, [games, teams]);

  const scoringLeaders = useMemo(() => {
    let highestTeam: string | null = null;
    let lowestTeam: string | null = null;
    let highestValue = -Infinity;
    let lowestValue = Infinity;

    teamMetrics.forEach((metrics, code) => {
      if (metrics.avgScored === null) return;
      if (metrics.avgScored > highestValue) {
        highestValue = metrics.avgScored;
        highestTeam = code;
      }
      if (metrics.avgScored < lowestValue) {
        lowestValue = metrics.avgScored;
        lowestTeam = code;
      }
    });

    return { highestTeam, lowestTeam };
  }, [teamMetrics]);

  const sortedTeams = useMemo(() => {
    const divisionRank = new Map(
      DIVISION_ORDER.map((division, index) => [division, index])
    );
    return [...teams].sort((a, b) => {
      const aDivision = `${a.conference} ${a.division}`.trim();
      const bDivision = `${b.conference} ${b.division}`.trim();
      const aRank = divisionRank.get(aDivision) ?? Number.MAX_SAFE_INTEGER;
      const bRank = divisionRank.get(bDivision) ?? Number.MAX_SAFE_INTEGER;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }, [teams]);

  return (
    <section className="section">
      <div className="section-header">
        <p className="section-eyebrow">Teams</p>
        <h2>League Identity Board</h2>
        <p>Pick a team to explore fantasy roles, depth, and player profiles.</p>
      </div>

      <div className="teams-hero">
        <div>
          <p className="hero-eyebrow">Season snapshot</p>
          <h3>{season ? `${season} teams` : "Loading season…"}</h3>
          <p className="subtitle">
            Visual scan of offensive postions, built for fantasy decision paths.
          </p>
        </div>
        <label className="teams-hero-chip">
          <span>Season</span>
          <select
            value={season ?? ""}
            onChange={(event) => setSeason(Number(event.target.value))}
          >
            {Array.from(
              new Set([...(filters?.seasons ?? []), ...SEASONS])
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error">Error: {error}</p>}
      {!teams.length && !error && <p className="loading">Loading teams…</p>}

      <div className="teams-grid">
        {sortedTeams.map((team) => {
          const metrics = teamMetrics.get(team.code);
          const pills: { label: string; variant: string }[] = [];
          if (team.code === scoringLeaders.highestTeam) {
            pills.push({ label: "Top scoring offense", variant: "pill-top" });
          }
          if (team.code === scoringLeaders.lowestTeam) {
            pills.push({ label: "Lowest scoring offense", variant: "pill-low" });
          }
          if (honors?.super_bowl === team.code) {
            pills.push({ label: "Super Bowl Champs", variant: "pill-superbowl" });
          }
          if (honors?.afc_champion === team.code) {
            pills.push({ label: "AFC Champs", variant: "pill-conference" });
          }
          if (honors?.nfc_champion === team.code) {
            pills.push({ label: "NFC Champs", variant: "pill-conference" });
          }
          return (
            <Link
              key={team.code}
              to={`/teams/${team.code}`}
              className="team-card"
            >
              <div className="team-card-top">
                <div className="team-logo-wrap">
                  {TEAM_LOGOS[team.code] && (
                    <img
                      src={TEAM_LOGOS[team.code]}
                      alt={`${team.name} logo`}
                      loading="lazy"
                    />
                  )}
                </div>
                <div>
                  <p>{team.conference} · {team.division}</p>
                  <h4>{team.name}</h4>
                </div>
              </div>
              <div className="team-card-metrics">
                <div>
                  <span>Avg scored</span>
                  <strong>{formatValue(metrics?.avgScored ?? null)}</strong>
                </div>
                <div>
                  <span>Avg allowed</span>
                  <strong>{formatValue(metrics?.avgAllowed ?? null)}</strong>
                </div>
              </div>
              <div className="team-card-tags">
                {pills.map((pill) => (
                  <span key={pill.label} className={`team-pill ${pill.variant}`}>
                    {pill.label}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>

      {filters && (
        <p className="teams-footnote">
          Season defaults to latest available ({filters.seasons[filters.seasons.length - 1]}).
        </p>
      )}
    </section>
  );
}
