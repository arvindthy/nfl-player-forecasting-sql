export interface ForecastRow {
  player_name: string;
  team: string;
  forecast_ppr_points: string; // IMPORTANT: string from SQL
  actual_ppr_points?: string | null;
}

export interface ForecastResponse {
  season: number;
  week: number;
  position: string;
  results: ForecastRow[];
}

export interface PlayerDetailRecord {
  player_id?: string;
  player_name?: string;
  player_display_name?: string;
  position?: string;
  position_group?: string;
  headshot_url?: string;
  season?: string;
  season_type?: string;
  recent_team?: string;
  games?: string;
  completions?: string;
  attempts?: string;
  passing_yards?: string;
  passing_tds?: string;
  passing_interceptions?: string;
  passing_air_yards?: string;
  passing_yards_after_catch?: string;
  passing_first_downs?: string;
  passing_epa?: string;
  passing_cpoe?: string;
  carries?: string;
  rushing_yards?: string;
  rushing_tds?: string;
  rushing_first_downs?: string;
  rushing_epa?: string;
  receptions?: string;
  targets?: string;
  receiving_yards?: string;
  receiving_tds?: string;
  receiving_first_downs?: string;
  receiving_epa?: string;
  [key: string]: string | undefined;
}

export interface PlayerDetailsResponse {
  season: number;
  player_name: string;
  records: PlayerDetailRecord[];
}

export interface OutliersResponse {
  season: number;
  results: Array<{
    player_name: string;
    week: number;
    position: string;
    predicted: string;
    actual: string;
    abs_error: string;
  }>;
}
