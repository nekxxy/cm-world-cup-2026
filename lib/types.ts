/**
 * Core domain types for the WC2026 dataset.
 *
 * These mirror the shape of `data/wc2026.json`, which is produced by
 * `scripts/seed.ts` from API-Football. The app's runtime read-path
 * (`lib/data.ts`) consumes this JSON so the app is fully usable offline from
 * the committed seed (per the spec's hybrid data strategy). The Prisma schema
 * (`prisma/schema.prisma`) mirrors these for DB-backed deployments + the User
 * model used by auth/notifications.
 */

export type Stage = "group" | "r32" | "r16" | "qf" | "sf" | "3rd" | "final";

export type MatchStatus = "scheduled" | "live" | "finished";

export interface Venue {
  /** Stable slug id, e.g. "mexico-city". */
  id: string;
  city: string;
  /** Full country name. */
  country: string;
  /** ISO-3166 alpha-2, for flag rendering. */
  countryCode: string;
  stadium: string;
  lat: number;
  lon: number;
  /** Estadio Azteca — opening match. */
  opening?: boolean;
  /** MetLife Stadium — the final. */
  final?: boolean;
}

export interface TeamColors {
  primary: string;
  secondary?: string;
}

export interface Team {
  /** API-Football team id. */
  id: number;
  name: string;
  /** 3-letter code, e.g. "ARG". */
  code: string | null;
  /** Flag image URL (svg/png). */
  flagUrl: string | null;
  /** Crest/logo URL. */
  logoUrl?: string | null;
  fifaRank?: number | null;
  /** Group "A".."L", or null if not yet drawn/seeded. */
  groupId: string | null;
  /** Used for match-day theming; sourced/curated, optional. */
  colors?: TeamColors | null;
}

export interface GroupStanding {
  teamId: number;
  rank: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  /** e.g. "WWD" recent form, if available. */
  form?: string | null;
}

export interface Group {
  id: string; // "A".."L"
  teamIds: number[];
  standings: GroupStanding[];
}

export interface Match {
  /** API-Football fixture id. */
  id: number;
  stage: Stage;
  /** Group id for group-stage matches. */
  groupId: string | null;
  /** Raw round label from source, e.g. "Round of 16". */
  round?: string | null;
  /** Null for not-yet-determined knockout slots. */
  homeTeamId: number | null;
  awayTeamId: number | null;
  /** Placeholder label when team unknown, e.g. "Winner Group A". */
  homePlaceholder?: string | null;
  awayPlaceholder?: string | null;
  venueId: string | null;
  /** Kickoff in UTC (ISO 8601). Rendered in IST via lib/ist.ts. */
  kickoffUtc: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  /** Live minute, when status === "live". */
  minute?: number | null;
}

export interface WCMeta {
  league: number;
  season: number;
  /** Where the data came from. "seed-pending" = keyless placeholder. */
  source: "api-football" | "seed-pending";
  generatedAt: string;
  counts: { teams: number; groups: number; matches: number; venues: number };
  note?: string;
}

export interface WCData {
  meta: WCMeta;
  venues: Venue[];
  teams: Team[];
  groups: Group[];
  matches: Match[];
}
