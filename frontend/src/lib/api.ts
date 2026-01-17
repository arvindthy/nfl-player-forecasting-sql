const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

function buildAuthHeaders() {
  if (!API_TOKEN) {
    return {};
  }

  return { Authorization: `Token ${API_TOKEN}` };
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
