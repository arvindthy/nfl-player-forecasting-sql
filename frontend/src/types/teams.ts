export interface TeamSummary {
  code: string;
  name: string;
  city: string;
  conference: string;
  division: string;
  description?: string | null;
}

export interface TeamsResponse {
  season?: number;
  teams: TeamSummary[];
  honors?: {
    super_bowl?: string | null;
    afc_champion?: string | null;
    nfc_champion?: string | null;
  };
}

export interface TeamRosterPlayer {
  player_name: string;
  player_display_name: string;
  position: string;
  team: string;
  fantasy_points_ppr: number;
  role_hint: string;
  rank_in_position: number;
}

export interface TeamRosterResponse {
  season: number;
  team: TeamSummary;
  roster: TeamRosterPlayer[];
}
