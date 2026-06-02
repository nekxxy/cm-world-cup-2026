import raw from "@/data/wc2026.json";
import type {
  Group,
  GroupStanding,
  Match,
  Stage,
  Team,
  Venue,
  WCData,
} from "./types";

/**
 * Typed accessors over the committed seed (data/wc2026.json). This is the
 * app's runtime read-path for sports data, so it works fully offline. When
 * the seed is keyless, teams/groups/matches are empty and views show clean
 * empty states — we never fabricate data.
 */
const data = raw as unknown as WCData;

export function getMeta() {
  return data.meta;
}

/** True once a real (non-keyless) seed has populated teams/fixtures. */
export function hasTeamData() {
  return data.teams.length > 0;
}
export function hasFixtureData() {
  return data.matches.length > 0;
}

// ── Venues ───────────────────────────────────────────────────────────────
export function getVenues(): Venue[] {
  return data.venues;
}
const venueById = new Map(data.venues.map((v) => [v.id, v]));
export function getVenue(id: string | null | undefined): Venue | undefined {
  return id ? venueById.get(id) : undefined;
}

// ── Teams ────────────────────────────────────────────────────────────────
export function getTeams(): Team[] {
  return data.teams;
}
const teamById = new Map(data.teams.map((t) => [t.id, t]));
export function getTeam(id: number | null | undefined): Team | undefined {
  return id == null ? undefined : teamById.get(id);
}
export function getTeamsByGroup(groupId: string): Team[] {
  return data.teams
    .filter((t) => t.groupId === groupId)
    .sort((a, b) => a.name.localeCompare(b.name));
}
/** Teams sorted by FIFA rank (ranked first), then name. */
export function getTeamsSorted(): Team[] {
  return data.teams.slice().sort((a, b) => {
    const ra = a.fifaRank ?? Number.POSITIVE_INFINITY;
    const rb = b.fifaRank ?? Number.POSITIVE_INFINITY;
    if (ra !== rb) return ra - rb;
    return a.name.localeCompare(b.name);
  });
}

// ── Groups & standings ─────────────────────────────────────────────────────
export function getGroups(): Group[] {
  return data.groups.slice().sort((a, b) => a.id.localeCompare(b.id));
}
const groupById = new Map(data.groups.map((g) => [g.id, g]));
export function getGroup(id: string | null | undefined): Group | undefined {
  return id ? groupById.get(id) : undefined;
}
export function getStandings(groupId: string): GroupStanding[] {
  return getGroup(groupId)?.standings.slice().sort((a, b) => a.rank - b.rank) ?? [];
}

// ── Matches ──────────────────────────────────────────────────────────────
export function getMatches(): Match[] {
  return data.matches
    .slice()
    .sort((a, b) => Date.parse(a.kickoffUtc) - Date.parse(b.kickoffUtc));
}
const matchById = new Map(data.matches.map((m) => [m.id, m]));
export function getMatch(id: number | null | undefined): Match | undefined {
  return id == null ? undefined : matchById.get(id);
}
export function getMatchesForTeam(teamId: number): Match[] {
  return getMatches().filter(
    (m) => m.homeTeamId === teamId || m.awayTeamId === teamId,
  );
}
export function getMatchesByVenue(venueId: string): Match[] {
  return getMatches().filter((m) => m.venueId === venueId);
}
export function getMatchesByGroup(groupId: string): Match[] {
  return getMatches().filter((m) => m.groupId === groupId);
}
export function getMatchesByStage(stage: Stage): Match[] {
  return getMatches().filter((m) => m.stage === stage);
}

/** Earliest fixture — the opening match (for the global countdown). */
export function getOpeningMatch(): Match | undefined {
  return getMatches()[0];
}
export function getLiveMatches(): Match[] {
  return getMatches().filter((m) => m.status === "live");
}

export interface ResolvedSide {
  team: Team | null;
  label: string; // team name, or knockout placeholder, or "TBD"
}
/** Resolve a match's two sides to teams or human-readable placeholders. */
export function resolveSides(m: Match): { home: ResolvedSide; away: ResolvedSide } {
  const side = (id: number | null, placeholder?: string | null): ResolvedSide => {
    const team = getTeam(id) ?? null;
    return { team, label: team?.name ?? placeholder ?? "TBD" };
  };
  return {
    home: side(m.homeTeamId, m.homePlaceholder),
    away: side(m.awayTeamId, m.awayPlaceholder),
  };
}

export { STAGE_LABELS } from "./stages";
