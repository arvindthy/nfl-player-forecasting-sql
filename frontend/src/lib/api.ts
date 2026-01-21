const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

function buildAuthHeaders() {
  if (!API_TOKEN) {
    return undefined;
  }

  return { Authorization: `Token ${API_TOKEN}` } as const;
}

export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/api/v1/analytics/overview/`, {
    headers: buildAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch overview: ${res.status}`);
  }

  return res.json();
}

export async function fetchForecasts(
  season: number,
  week: number,
  position: string
) {
  const params = new URLSearchParams({
    season: season.toString(),
    week: week.toString(),
    position
  });

  const res = await fetch(
    `${API_BASE}/api/v1/analytics/forecasts/?${params.toString()}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch forecasts (${res.status})`);
  }

  return res.json();
}

export async function fetchPlayerDetails(
  season: number,
  player: string,
  team?: string,
  position?: string
) {
  const params = new URLSearchParams({
    season: season.toString(),
    player,
  });
  if (team) {
    params.set("team", team);
  }
  if (position) {
    params.set("position", position);
  }

  const res = await fetch(
    `${API_BASE}/api/v1/analytics/player-details/?${params.toString()}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch player details (${res.status})`);
  }

  return res.json();
}

export async function fetchMetrics(season: number) {
  const params = new URLSearchParams({ season: season.toString() });
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/metrics/?${params.toString()}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch metrics (${res.status})`);
  }

  return res.json();
}

export async function fetchMetricsByPosition(season: number) {
  const params = new URLSearchParams({ season: season.toString() });
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/metrics/by-position/?${params.toString()}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch metrics by position (${res.status})`);
  }

  return res.json();
}

export async function fetchMetricsByWeek(season: number) {
  const params = new URLSearchParams({ season: season.toString() });
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/metrics/by-week/?${params.toString()}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch weekly metrics (${res.status})`);
  }

  return res.json();
}

export async function fetchFilters() {
  const res = await fetch(`${API_BASE}/api/v1/analytics/filters/`, {
    headers: buildAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch filters (${res.status})`);
  }

  return res.json();
}

export async function fetchOutliers(season: number, limit = 25) {
  const params = new URLSearchParams({
    season: season.toString(),
    limit: limit.toString(),
  });
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/outliers/?${params.toString()}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch outliers (${res.status})`);
  }

  return res.json();
}

export async function fetchMvp(season: number) {
  const params = new URLSearchParams({ season: season.toString() });
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/mvp/?${params.toString()}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch MVP (${res.status})`);
  }

  return res.json();
}

export async function fetchMvpByPosition(season: number) {
  const params = new URLSearchParams({ season: season.toString() });
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/mvp/by-position/?${params.toString()}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch MVPs by position (${res.status})`);
  }

  return res.json();
}

export async function fetchGames(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/games/?${query}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch games (${res.status})`);
  }

  return res.json();
}

export async function fetchTeams(season: number) {
  const params = new URLSearchParams({ season: season.toString() });
  const res = await fetch(`${API_BASE}/api/v1/analytics/teams/?${params.toString()}`, {
    headers: buildAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch teams (${res.status})`);
  }

  return res.json();
}

export async function fetchTeamRoster(season: number, teamCode: string) {
  const params = new URLSearchParams({ season: season.toString() });
  const res = await fetch(
    `${API_BASE}/api/v1/analytics/teams/${teamCode}/roster/?${params.toString()}`,
    { headers: buildAuthHeaders() }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch team roster (${res.status})`);
  }

  return res.json();
}
