// Server-side API-Football (api-sports.io) v3 client. The key lives only in
// env (API_FOOTBALL_KEY) and never reaches the browser. World Cup 2026 is
// league 1, season 2026 by default (overridable via env).

const BASE = process.env.API_FOOTBALL_BASE ?? "https://v3.football.api-sports.io";
const KEY = process.env.API_FOOTBALL_KEY;
export const WC_LEAGUE_ID = Number(process.env.WC_LEAGUE_ID ?? 1);
export const WC_SEASON = Number(process.env.WC_SEASON ?? 2026);
export const API_SOURCE = `api-football:league=${WC_LEAGUE_ID};season=${WC_SEASON}`;

export function apiFootballConfigured(): boolean {
  return Boolean(KEY);
}

interface ApiResponse<T> {
  response: T[];
  results: number;
  errors: unknown;
}

async function apiGet<T>(path: string): Promise<T[]> {
  if (!KEY) throw new Error("API_FOOTBALL_KEY is not configured");
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": KEY },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API-Football ${path} → HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<T>;
  // API-Football returns errors as either [] or an object map.
  const errs = json.errors;
  if (errs && ((Array.isArray(errs) && errs.length) || (!Array.isArray(errs) && Object.keys(errs).length))) {
    throw new Error(`API-Football ${path} → ${JSON.stringify(errs)}`);
  }
  return json.response ?? [];
}

// ---- Typed slices of the responses we actually use --------------------------

export interface AFTeamEntry {
  team: { id: number; name: string; code?: string | null; country?: string; logo?: string };
  venue?: { id?: number; name?: string; city?: string; image?: string };
}

export interface AFFixtureEntry {
  fixture: {
    id: number;
    date: string;
    status?: { short?: string; long?: string };
    venue?: { id?: number; name?: string; city?: string };
  };
  league?: { round?: string; country?: string };
  teams?: {
    home?: { id?: number; name?: string; logo?: string };
    away?: { id?: number; name?: string; logo?: string };
  };
  goals?: { home?: number | null; away?: number | null };
}

export interface AFSquadEntry {
  team?: { id?: number; name?: string };
  players?: { id: number; name: string; age?: number; number?: number | null; position?: string; photo?: string }[];
}

export function getWorldCupTeams() {
  return apiGet<AFTeamEntry>(`/teams?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`);
}

export function getWorldCupFixtures() {
  return apiGet<AFFixtureEntry>(`/fixtures?league=${WC_LEAGUE_ID}&season=${WC_SEASON}`);
}

export function getSquad(teamId: number) {
  return apiGet<AFSquadEntry>(`/players/squads?team=${teamId}`);
}
