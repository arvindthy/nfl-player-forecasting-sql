export interface MetricsResponse {
  season: number;
  metrics: {
    mae: {
      baseline: number | null;
      weighted: number | null;
      enhanced: number | null;
    };
    bias: {
      baseline: number | null;
      weighted: number | null;
      enhanced: number | null;
    };
  };
}

export interface MetricsByPositionResponse {
  season: number;
  metrics: Record<string, { mae: number | null }>;
}

export interface WeeklyMaeResponse {
  season: number;
  weekly_mae: Array<{ week: number; mae: number | null }>;
}

export interface MvpResponse {
  season: number;
  player_id?: string;
  player_name?: string;
  player_display_name?: string;
  position?: string;
  recent_team?: string;
  fantasy_points_ppr?: number;
  headshot_url?: string;
}

export interface MvpByPositionResponse {
  season: number;
  mvps: Record<
    string,
    {
      player_id?: string;
      player_name?: string;
      player_display_name?: string;
      position?: string;
      recent_team?: string;
      fantasy_points_ppr?: number;
      headshot_url?: string;
    }
  >;
}
