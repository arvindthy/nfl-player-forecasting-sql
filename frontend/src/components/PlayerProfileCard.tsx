import type { ReactNode } from "react";
import { TEAM_LOGOS } from "@/lib/teamLogos";
import type { PlayerDetailsResponse, PlayerDetailRecord } from "@/types/forecast";

type PlayerProfileCardProps = {
  selectedPlayer: string;
  position?: string;
  season?: number | null;
  playerDetails: PlayerDetailsResponse | null;
  detailsLoading: boolean;
  detailsError: string | null;
  headerAction?: ReactNode;
  className?: string;
};

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

const renderStatGroup = (
  record: PlayerDetailRecord,
  title: string,
  keys: Array<[string, string]>
) => {
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

export default function PlayerProfileCard({
  selectedPlayer,
  position,
  season,
  playerDetails,
  detailsLoading,
  detailsError,
  headerAction,
  className,
}: PlayerProfileCardProps) {
  const getLogo = (team?: string) => (team ? TEAM_LOGOS[team] : undefined);
  const cardClassName = ["modal-card", className].filter(Boolean).join(" ");
  const displayName =
    playerDetails?.records?.[0]?.player_display_name || selectedPlayer;
  const team = playerDetails?.records?.[0]?.recent_team;
  const displayPosition = playerDetails?.records?.[0]?.position || position;

  return (
    <div className={cardClassName}>
      {headerAction}
      <div className="modal-header">
        {playerDetails?.records?.[0]?.headshot_url && (
          <img
            src={playerDetails.records[0].headshot_url}
            alt={displayName}
            className="player-headshot"
          />
        )}
        <div>
          <p className="modal-eyebrow">Player Profile</p>
          <h2>{displayName}</h2>
          <p className="modal-subtitle">
            {displayPosition}
            {team ? ` · ${team}` : ""}
            {season ? ` · Season ${season}` : ""}
          </p>
        </div>
        {team && getLogo(team) && (
          <div className="player-team-mark">
            <img src={getLogo(team)} alt={`${team} logo`} loading="lazy" />
          </div>
        )}
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
  );
}
