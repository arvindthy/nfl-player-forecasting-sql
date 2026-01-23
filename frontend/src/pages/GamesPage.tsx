import { Fragment, useEffect, useMemo, useState } from "react";
import { fetchGamePlayers, fetchGames, fetchPlayerDetails } from "@/lib/api";
import PlayerProfileCard from "@/components/PlayerProfileCard";
import type { GamesResponse, GameRow, GamePlayersResponse, GamePlayerRow } from "@/types/games";
import type { PlayerDetailsResponse } from "@/types/forecast";
import { TEAM_LOGOS } from "@/lib/teamLogos";
import "@/styles/forecast.css";

const SEASONS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);


const buildBadges = (game: GameRow) => {
  const margin = Math.abs(game.home_score - game.away_score);
  const badges: string[] = [];
  if (game.overtime) badges.push("Overtime");
  if (margin >= 14) badges.push("Blowout");
  if (margin <= 3) badges.push("Close");
  const upset =
    game.spread_line !== null &&
    ((game.is_favorite_home && !game.home_win) ||
      (game.is_favorite_home === false && game.home_win));
  if (upset) badges.push("Upset");
  return badges;
};

const formatMargin = (game: GameRow) =>
  Math.abs(game.home_score - game.away_score);

const getWinner = (game: GameRow) => (game.home_win ? game.home_team : game.away_team);
const getLogo = (team: string) => TEAM_LOGOS[team];
const formatYards = (value?: number | null) =>
  value === null || value === undefined ? "—" : Math.round(value).toString();
const formatPpr = (value?: number | null) =>
  value === null || value === undefined ? "—" : Number(value).toFixed(1);
const POSITION_ORDER = ["QB", "RB", "FB", "WR", "TE"];

const HighlightCard = ({
  label,
  game,
  meta,
  onClick,
}: {
  label: string;
  game: GameRow;
  meta: string;
  onClick: () => void;
}) => (
  <button type="button" className="highlight-card result-card" onClick={onClick}>
    <div className="result-top">
      <span>{label}</span>
      <span>W{game.week}</span>
    </div>
    <div className="result-teams">
      <div className={game.home_win ? "team-row winner" : "team-row"}>
        <div className="team-label">
          {getLogo(game.home_team) && (
            <img
              className="team-logo"
              src={getLogo(game.home_team)}
              alt={`${game.home_team} logo`}
              loading="lazy"
            />
          )}
          <strong>{game.home_team}</strong>
        </div>
        <span>{game.home_score}</span>
      </div>
      <div className={!game.home_win ? "team-row winner" : "team-row"}>
        <div className="team-label">
          {getLogo(game.away_team) && (
            <img
              className="team-logo"
              src={getLogo(game.away_team)}
              alt={`${game.away_team} logo`}
              loading="lazy"
            />
          )}
          <strong>{game.away_team}</strong>
        </div>
        <span>{game.away_score}</span>
      </div>
    </div>
    <div className="result-meta">
      <span className="meta-pill">{meta}</span>
    </div>
  </button>
);

const GameResultsBoard = ({
  games,
  onSelect,
}: {
  games: GameRow[];
  onSelect: (game: GameRow) => void;
}) => (
  <div className="results-board">
    {games.map((game) => {
      const margin = formatMargin(game);
      const winner = getWinner(game);
      const intensity = Math.min(1, margin / 28);
      const badges = buildBadges(game);
      return (
        <button
          key={game.game_id}
          type="button"
          className="result-card"
          onClick={() => onSelect(game)}
          style={{
            borderLeftColor: `rgba(var(--color-accent-rgb), ${0.2 + intensity * 0.6})`,
          }}
        >
          <div className="result-top">
            <span>W{game.week}</span>
            <span>{game.gameday}</span>
          </div>
          <div className="result-teams">
            <div className={game.home_win ? "team-row winner" : "team-row"}>
              <div className="team-label">
                {getLogo(game.home_team) && (
                  <img
                    className="team-logo"
                    src={getLogo(game.home_team)}
                    alt={`${game.home_team} logo`}
                    loading="lazy"
                  />
                )}
                <strong>{game.home_team}</strong>
              </div>
              <span>{game.home_score}</span>
            </div>
            <div className={!game.home_win ? "team-row winner" : "team-row"}>
              <div className="team-label">
                {getLogo(game.away_team) && (
                  <img
                    className="team-logo"
                    src={getLogo(game.away_team)}
                    alt={`${game.away_team} logo`}
                    loading="lazy"
                  />
                )}
                <strong>{game.away_team}</strong>
              </div>
              <span>{game.away_score}</span>
            </div>
          </div>
          <div className="result-meta">
            <span className="winner-pill">{winner} wins</span>
            <span className="meta-pill">Total {game.total_points}</span>
            <span className="meta-pill">Spread {game.spread_line ?? "—"}</span>
          </div>
          <div className="result-badges">
            {badges.map((badge) => (
              <span key={badge} className={`badge badge-${badge.replace(" ", "").toLowerCase()}`}>
                {badge}
              </span>
            ))}
          </div>
        </button>
      );
    })}
  </div>
);

export default function GamesPage() {
  const [data, setData] = useState<GamesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameRow | null>(null);
  const [selectedGamePlayers, setSelectedGamePlayers] = useState<GamePlayersResponse | null>(null);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [activeTeamTab, setActiveTeamTab] = useState<"away" | "home">("away");
  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayerRow | null>(null);
  const [playerDetails, setPlayerDetails] = useState<PlayerDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);

  const [season, setSeason] = useState<number[]>([2024]);
  const [week, setWeek] = useState<number[]>([]);
  const [team, setTeam] = useState<string>("");
  const [divGame, setDivGame] = useState<string>("all");
  const [spreadMin, setSpreadMin] = useState<string>("");
  const [spreadMax, setSpreadMax] = useState<string>("");
  const [totalMin, setTotalMin] = useState<string>("");
  const [totalMax, setTotalMax] = useState<string>("");
  const [roof, setRoof] = useState<string>("");
  const [surface, setSurface] = useState<string>("");
  const [tempMin, setTempMin] = useState<string>("");
  const [tempMax, setTempMax] = useState<string>("");
  const [windMin, setWindMin] = useState<string>("");
  const [windMax, setWindMax] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (season.length) params.season = season.join(",");
    if (week.length) params.week = week.join(",");
    if (team) params.team = team.toUpperCase();
    if (divGame !== "all") params.div_game = divGame;
    if (spreadMin) params.spread_min = spreadMin;
    if (spreadMax) params.spread_max = spreadMax;
    if (totalMin) params.total_min = totalMin;
    if (totalMax) params.total_max = totalMax;
    if (roof) params.roof = roof;
    if (surface) params.surface = surface;
    if (tempMin) params.temp_min = tempMin;
    if (tempMax) params.temp_max = tempMax;
    if (windMin) params.wind_min = windMin;
    if (windMax) params.wind_max = windMax;
    return params;
  }, [
    season,
    week,
    team,
    divGame,
    spreadMin,
    spreadMax,
    totalMin,
    totalMax,
    roof,
    surface,
    tempMin,
    tempMax,
    windMin,
    windMax,
  ]);

  useEffect(() => {
    setError(null);
    const timeout = setTimeout(() => {
      fetchGames(queryParams)
        .then(setData)
        .catch((err) => setError(err.message));
    }, 200);

    return () => clearTimeout(timeout);
  }, [queryParams]);

  useEffect(() => {
    if (!selectedGame) {
      setSelectedGamePlayers(null);
      setPlayersError(null);
      setPlayersLoading(false);
      setSelectedPlayer(null);
      return;
    }

    setActiveTeamTab("away");
    setPlayersLoading(true);
    setPlayersError(null);

    fetchGamePlayers(selectedGame.game_id)
      .then((response) => setSelectedGamePlayers(response))
      .catch((err) => setPlayersError(err.message))
      .finally(() => setPlayersLoading(false));
  }, [selectedGame]);

  useEffect(() => {
    if (!selectedPlayer || !selectedGame) {
      setPlayerDetails(null);
      setDetailsError(null);
      setDetailsLoading(false);
      return;
    }

    const playerName = selectedPlayer.player_display_name || selectedPlayer.player_name;
    setPlayerDetails(null);
    setDetailsLoading(true);
    setDetailsError(null);

    const loadDetails = async () => {
      try {
        const response = await fetchPlayerDetails(
          selectedGame.season,
          playerName,
          selectedPlayer.team,
          selectedPlayer.position || undefined
        );
        setPlayerDetails(response);
      } catch (err) {
        try {
          const fallback = await fetchPlayerDetails(selectedGame.season, playerName);
          setPlayerDetails(fallback);
          return;
        } catch (fallbackErr) {
          const message =
            fallbackErr instanceof Error ? fallbackErr.message : "Failed to load player details.";
          setDetailsError(message);
          return;
        }
      } finally {
        setDetailsLoading(false);
      }
    };

    loadDetails();
  }, [selectedGame, selectedPlayer]);

  const sortedRows = useMemo(() => {
    if (!data?.results) return [];
    const rows = [...data.results];
    rows.sort((a, b) => {
      if (a.season !== b.season) {
        return b.season - a.season;
      }
      if (a.week !== b.week) {
        return b.week - a.week;
      }
      if (a.gameday < b.gameday) return 1;
      if (a.gameday > b.gameday) return -1;
      return 0;
    });
    return rows;
  }, [data]);

  const summary = data?.summary;
  const results = data?.results ?? [];
  const overtimeGames = useMemo(
    () => results.filter((game) => game.overtime),
    [results]
  );
  const teams = useMemo(() => {
    const list = new Set<string>();
    results.forEach((game) => {
      if (game.home_team) list.add(game.home_team);
      if (game.away_team) list.add(game.away_team);
    });
    return Array.from(list).sort();
  }, [results]);

  const highlights = useMemo(() => {
    if (!results.length) return null;
    const highest = results.reduce((acc, game) =>
      game.total_points > acc.total_points ? game : acc
    );
    const blowout = results.reduce((acc, game) =>
      formatMargin(game) > formatMargin(acc) ? game : acc
    );
    const upsetCandidates = results.filter((game) =>
      buildBadges(game).includes("Upset")
    );
    const upset =
      upsetCandidates.length > 0
        ? upsetCandidates.reduce((acc, game) => {
            const accMiss = Math.abs((acc.home_score - acc.away_score) + (acc.spread_line ?? 0));
            const gameMiss = Math.abs((game.home_score - game.away_score) + (game.spread_line ?? 0));
            return gameMiss > accMiss ? game : acc;
          })
        : null;
    const overtimeCount = results.filter((game) => game.overtime).length;
    return { highest, blowout, upset, overtimeCount };
  }, [results]);

  const quickSeasonValue = season.length ? String(season[0]) : "all";
  const quickWeekValue = week.length ? String(week[0]) : "all";
  const quickTeamValue = team ? team.toUpperCase() : "all";
  const quickDivValue = divGame;

  const snapshotTitle = season.length
    ? season.length === 1
      ? `${season[0]} games`
      : `${season[0]}–${season[season.length - 1]} games`
    : "All games";

  const teamTabs = [
    {
      key: "away" as const,
      label: selectedGame?.away_team ?? "Away",
      logo: selectedGame ? getLogo(selectedGame.away_team) : undefined,
    },
    {
      key: "home" as const,
      label: selectedGame?.home_team ?? "Home",
      logo: selectedGame ? getLogo(selectedGame.home_team) : undefined,
    },
  ];

  const activePlayers =
    activeTeamTab === "home"
      ? selectedGamePlayers?.home_players ?? []
      : selectedGamePlayers?.away_players ?? [];
  const groupedPlayers = useMemo(() => {
    const groups = new Map<string, GamePlayerRow[]>();
    POSITION_ORDER.forEach((pos) => groups.set(pos, []));
    activePlayers.forEach((player) => {
      const pos = player.position || "—";
      if (!groups.has(pos)) {
        groups.set(pos, []);
      }
      groups.get(pos)?.push(player);
    });
    const ordered: Array<[string, GamePlayerRow[]]> = [];
    POSITION_ORDER.forEach((pos) => {
      const list = groups.get(pos);
      if (list && list.length) {
        ordered.push([pos, list]);
      }
    });
    groups.forEach((list, pos) => {
      if (POSITION_ORDER.includes(pos) || !list.length) return;
      ordered.push([pos, list]);
    });
    return ordered;
  }, [activePlayers]);

  return (
    <section className="section games-dashboard">
      <div className="section-header">
        <p className="section-eyebrow">Games</p>
        <h2>Games Dashboard</h2>
        <p>Filter and scan matchups across seasons, spreads, and conditions.</p>
      </div>

      <div className="games-hero">
        <div>
          <p className="hero-eyebrow">Teams snapshot</p>
          <h3>{snapshotTitle}</h3>
          <p className="subtitle">Quick view of the selected matchup slice.</p>
        </div>
        <div className="games-hero-controls">
          <label className="games-hero-chip">
            <span>Season</span>
            <select
              value={quickSeasonValue}
              onChange={(event) => {
                const value = event.target.value;
                setSeason(value === "all" ? [] : [Number(value)]);
              }}
            >
              <option value="all">All</option>
              {SEASONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="games-hero-chip">
            <span>Week</span>
            <select
              value={quickWeekValue}
              onChange={(event) => {
                const value = event.target.value;
                setWeek(value === "all" ? [] : [Number(value)]);
              }}
            >
              <option value="all">All</option>
              {WEEKS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="games-hero-chip">
            <span>Team</span>
            <select
              value={quickTeamValue}
              onChange={(event) =>
                setTeam(event.target.value === "all" ? "" : event.target.value)
              }
            >
              <option value="all">All</option>
              {teams.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="games-hero-chip">
            <span>Div Game</span>
            <select
              value={quickDivValue}
              onChange={(event) => setDivGame(event.target.value)}
            >
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>
      </div>

      {highlights && (
        <div className="highlights-bar">
          <HighlightCard
            label="Highest Scoring"
            game={highlights.highest}
            meta={`Total ${highlights.highest.total_points}`}
            onClick={() => setSelectedGame(highlights.highest)}
          />
          <HighlightCard
            label="Biggest Blowout"
            game={highlights.blowout}
            meta={`Margin ${formatMargin(highlights.blowout)}`}
            onClick={() => setSelectedGame(highlights.blowout)}
          />
          {highlights.upset ? (
            <HighlightCard
              label="Biggest Upset"
              game={highlights.upset}
              meta={`${getWinner(highlights.upset)} wins`}
              onClick={() => setSelectedGame(highlights.upset)}
            />
          ) : (
            <button type="button" className="highlight-card result-card" disabled>
              <div className="result-top">
                <span>Biggest Upset</span>
                <span>—</span>
              </div>
              <div className="result-teams">
                <div className="team-row">
                  <strong>—</strong>
                  <span>—</span>
                </div>
                <div className="team-row">
                  <strong>—</strong>
                  <span>—</span>
                </div>
              </div>
              <div className="result-meta">
                <span className="meta-pill">No upsets</span>
              </div>
            </button>
          )}
          <button
            type="button"
            className="highlight-card"
            onClick={() => (highlights.overtimeCount ? setShowOvertimeModal(true) : null)}
          >
            <span>Overtime Games</span>
            <strong>{highlights.overtimeCount}</strong>
            <p>{highlights.overtimeCount ? "Click to view" : "No overtime games"}</p>
          </button>
        </div>
      )}

      <button
        type="button"
        className="filter-toggle"
        onClick={() => setFiltersOpen((open) => !open)}
      >
        {filtersOpen ? "Hide advanced filters" : "Show advanced filters"}
      </button>

      {filtersOpen && (
      <div className="filter-bar collapsed">
        <div className="filter-group">
          <label>
            Season
            <select
              multiple
              value={season.map(String)}
              onChange={(event) => {
                const values = Array.from(event.target.selectedOptions, (o) => o.value);
                if (values.includes("all")) {
                  setSeason([]);
                } else {
                  setSeason(values.map(Number));
                }
              }}
            >
              <option value="all">All</option>
              {SEASONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label>
            Week
            <select
              multiple
              value={week.map(String)}
              onChange={(event) => {
                const values = Array.from(event.target.selectedOptions, (o) => o.value);
                if (values.includes("all")) {
                  setWeek([]);
                } else {
                  setWeek(values.map(Number));
                }
              }}
            >
              <option value="all">All</option>
              {WEEKS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Team
            <select value={team || "all"} onChange={(event) => setTeam(event.target.value === "all" ? "" : event.target.value)}>
              <option value="all">All</option>
              {teams.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            Div Game
            <select value={divGame} onChange={(event) => setDivGame(event.target.value)}>
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        </div>

        <div className="filter-group">
          <label>
            Spread Range
            <div className="range-row">
              <input
                type="number"
                placeholder="Min"
                value={spreadMin}
                onChange={(event) => setSpreadMin(event.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                value={spreadMax}
                onChange={(event) => setSpreadMax(event.target.value)}
              />
            </div>
          </label>
          <label>
            Total Range
            <div className="range-row">
              <input
                type="number"
                placeholder="Min"
                value={totalMin}
                onChange={(event) => setTotalMin(event.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                value={totalMax}
                onChange={(event) => setTotalMax(event.target.value)}
              />
            </div>
          </label>
        </div>
        <div className="filter-group">
          <label>
            Roof
            <select
              value={roof || "all"}
              onChange={(event) =>
                setRoof(event.target.value === "all" ? "" : event.target.value)
              }
            >
              <option value="all">All</option>
              <option value="outdoors">Outdoors</option>
              <option value="dome">Dome</option>
              <option value="closed">Closed</option>
              <option value="open">Open</option>
            </select>
          </label>
          <label>
            Surface
            <select
              value={surface || "all"}
              onChange={(event) =>
                setSurface(event.target.value === "all" ? "" : event.target.value)
              }
            >
              <option value="all">All</option>
              <option value="grass">Grass</option>
              <option value="artificial">Artificial</option>
            </select>
          </label>
          <label>
            Temp (F)
            <div className="range-row">
              <input
                type="number"
                placeholder="Min"
                value={tempMin}
                onChange={(event) => setTempMin(event.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                value={tempMax}
                onChange={(event) => setTempMax(event.target.value)}
              />
            </div>
          </label>
          <label>
            Wind (mph)
            <div className="range-row">
              <input
                type="number"
                placeholder="Min"
                value={windMin}
                onChange={(event) => setWindMin(event.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                value={windMax}
                onChange={(event) => setWindMax(event.target.value)}
              />
            </div>
          </label>
        </div>
      </div>
      )}

      {error && <p className="error">Error: {error}</p>}
      {!data && !error && <p className="loading">Loading games…</p>}

      {summary && (
        <div className="kpi-strip">
          <div className="result-card kpi-card">
            <div className="result-top">
              <span>Games</span>
            </div>
            <div className="kpi-value">{summary.game_count}</div>
            <div className="result-meta">
              <span className="meta-pill">Total Games</span>
            </div>
          </div>
          <div className="result-card kpi-card">
            <div className="result-top">
              <span>Avg Total</span>
            </div>
            <div className="kpi-value">{summary.avg_total?.toFixed(1) ?? "—"}</div>
            <div className="result-meta">
              <span className="meta-pill">Pts/Game</span>
            </div>
          </div>
          <div className="result-card kpi-card">
            <div className="result-top">
              <span>Home Win %</span>
            </div>
            <div className="kpi-value">
              {summary.home_win_pct ? `${(summary.home_win_pct * 100).toFixed(1)}%` : "—"}
            </div>
            <div className="result-meta">
              <span className="meta-pill">Home Wins</span>
            </div>
          </div>
          <div className="result-card kpi-card">
            <div className="result-top">
              <span>Overs %</span>
            </div>
            <div className="kpi-value">
              {summary.over_pct ? `${(summary.over_pct * 100).toFixed(1)}%` : "—"}
            </div>
            <div className="result-meta">
              <span className="meta-pill">Over Total</span>
            </div>
          </div>
        </div>
      )}

      {data && <GameResultsBoard games={sortedRows} onSelect={setSelectedGame} />}

      {selectedGame && (
        <div className="modal-backdrop" onClick={() => setSelectedGame(null)}>
          <div className="game-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedGame(null)}>
              ×
            </button>
            <div className="game-modal-header">
              <div>
                <p className="modal-eyebrow">Game Detail</p>
                <h3 className="game-modal-title">
                  {getLogo(selectedGame.away_team) && (
                    <img
                      className="highlight-logo"
                      src={getLogo(selectedGame.away_team)}
                      alt={`${selectedGame.away_team} logo`}
                      loading="lazy"
                    />
                  )}
                  <span>{selectedGame.away_team}</span>
                  <span className="highlight-at">@</span>
                  {getLogo(selectedGame.home_team) && (
                    <img
                      className="highlight-logo"
                      src={getLogo(selectedGame.home_team)}
                      alt={`${selectedGame.home_team} logo`}
                      loading="lazy"
                    />
                  )}
                  <span>{selectedGame.home_team}</span>
                </h3>
                <p>
                  Week {selectedGame.week} · {selectedGame.gameday} · {selectedGame.gametime}
                </p>
              </div>
              <div className="score-pill">
                {selectedGame.away_score} - {selectedGame.home_score}
              </div>
            </div>
            <div className="game-modal-grid">
              <div>
                <span>Result</span>
                <strong>{getWinner(selectedGame)} wins</strong>
              </div>
              <div>
                <span>Total Points</span>
                <strong>{selectedGame.total_points}</strong>
              </div>
              <div>
                <span>Spread Winner</span>
                <strong>{selectedGame.spread_winner ?? "—"}</strong>
              </div>
              <div>
                <span>Over Hit</span>
                <strong>{selectedGame.over_hit === null ? "—" : selectedGame.over_hit ? "Over" : "Under"}</strong>
              </div>
              <div>
                <span>Total Line</span>
                <strong>{selectedGame.total_line ?? "—"}</strong>
              </div>
              <div>
                <span>Spread Line</span>
                <strong>{selectedGame.spread_line ?? "—"}</strong>
              </div>
              <div>
                <span>QB Matchup</span>
                <strong>{selectedGame.away_qb_name} vs {selectedGame.home_qb_name}</strong>
              </div>
              <div>
                <span>Rest Diff</span>
                <strong>{selectedGame.rest_diff ?? "—"}</strong>
              </div>
              <div>
                <span>Weather</span>
                <strong>{selectedGame.temp ?? "—"}° · {selectedGame.wind ?? "—"} mph</strong>
              </div>
              <div>
                <span>Roof / Surface</span>
                <strong>{selectedGame.roof ?? "—"} · {selectedGame.surface ?? "—"}</strong>
              </div>
              <div>
                <span>Stadium</span>
                <strong>{selectedGame.stadium ?? "—"}</strong>
              </div>
              <div>
                <span>Coaches</span>
                <strong>{selectedGame.away_coach} · {selectedGame.home_coach}</strong>
              </div>
            </div>
            <div className="game-modal-divider" />
            <div className="game-modal-tabs">
              {teamTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={activeTeamTab === tab.key ? "active" : ""}
                  onClick={() => setActiveTeamTab(tab.key)}
                >
                  {tab.logo && (
                    <img src={tab.logo} alt={`${tab.label} logo`} loading="lazy" />
                  )}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="game-modal-players">
              {playersLoading && <p className="loading">Loading player stats…</p>}
              {playersError && <p className="error">Error: {playersError}</p>}
              {!playersLoading && !playersError && (
                <>
                  {activePlayers.length ? (
                    <table className="game-player-table">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>Pos</th>
                          <th>Pass Yds</th>
                          <th>Rush Yds</th>
                          <th>Rec Yds</th>
                          <th>PPR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedPlayers.map(([pos, players]) => (
                          <Fragment key={pos}>
                            <tr className="game-player-group">
                              <td colSpan={6}>{pos}</td>
                            </tr>
                            {players.map((player) => {
                              const name = player.player_display_name || player.player_name;
                              return (
                                <tr
                                  key={`${player.player_id || name}-${player.team}`}
                                  className="game-player-row"
                                  onClick={() => setSelectedPlayer(player)}
                                >
                                  <td>{name}</td>
                                  <td>{player.position || "—"}</td>
                                  <td>{formatYards(player.passing_yards)}</td>
                                  <td>{formatYards(player.rushing_yards)}</td>
                                  <td>{formatYards(player.receiving_yards)}</td>
                                  <td>{formatPpr(player.fantasy_points_ppr)}</td>
                                </tr>
                              );
                            })}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="empty-state">No player stats available for this team.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {selectedPlayer && selectedGame && (
        <div
          className="modal-backdrop player-modal-backdrop"
          onClick={() => setSelectedPlayer(null)}
        >
          <div className="player-modal" onClick={(event) => event.stopPropagation()}>
            <PlayerProfileCard
              selectedPlayer={selectedPlayer.player_display_name || selectedPlayer.player_name}
              position={selectedPlayer.position || undefined}
              season={selectedGame.season}
              playerDetails={playerDetails}
              detailsLoading={detailsLoading}
              detailsError={detailsError}
              className="player-profile-card"
              headerAction={
                <button
                  className="modal-close"
                  type="button"
                  onClick={() => setSelectedPlayer(null)}
                >
                  ×
                </button>
              }
            />
          </div>
        </div>
      )}
      {showOvertimeModal && (
        <div className="modal-backdrop" onClick={() => setShowOvertimeModal(false)}>
          <div className="game-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowOvertimeModal(false)}>
              ×
            </button>
            <div className="game-modal-header">
              <div>
                <p className="modal-eyebrow">Overtime Games</p>
                <h3>{overtimeGames.length} overtime finishes</h3>
                <p>Tap a matchup to open full game detail.</p>
              </div>
            </div>
            <div className="highlights-bar overtime-grid">
              {overtimeGames.map((game) => (
                <HighlightCard
                  key={game.game_id}
                  label="Overtime"
                  game={game}
                  meta={`Total ${game.total_points}`}
                  onClick={() => {
                    setShowOvertimeModal(false);
                    setSelectedGame(game);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
