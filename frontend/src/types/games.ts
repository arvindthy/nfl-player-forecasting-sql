export interface GamesSummary {
  game_count: number;
  avg_total: number | null;
  home_win_pct: number | null;
  over_pct: number | null;
}

export interface GameRow {
  game_id: string;
  season: number;
  game_type: string;
  week: number;
  gameday: string;
  weekday: string;
  gametime: string;
  away_team: string;
  away_score: number;
  home_team: string;
  home_score: number;
  overtime: number | null;
  total_line: number | null;
  spread_line: number | null;
  div_game: boolean | null;
  roof: string | null;
  surface: string | null;
  temp: number | null;
  wind: number | null;
  away_qb_name: string | null;
  home_qb_name: string | null;
  away_coach: string | null;
  home_coach: string | null;
  stadium: string | null;
  home_win: boolean;
  total_points: number;
  over_hit: boolean | null;
  spread_winner: string | null;
  rest_diff: number | null;
  is_favorite_home: boolean | null;
}

export interface GamesResponse {
  summary: GamesSummary;
  results: GameRow[];
}

export interface GamePlayerRow {
  player_id?: string;
  player_name: string;
  player_display_name?: string;
  position?: string | null;
  team: string;
  passing_yards?: number;
  rushing_yards?: number;
  receiving_yards?: number;
  passing_tds?: number;
  rushing_tds?: number;
  receiving_tds?: number;
  fantasy_points_ppr?: number;
}

export interface GamePlayersResponse {
  game_id: string;
  season: number;
  week: number;
  home_team: string;
  away_team: string;
  home_players: GamePlayerRow[];
  away_players: GamePlayerRow[];
}
