/**
 * Tournament facts. These are stated directly in the product spec (§1) and are
 * public, verifiable facts about WC2026 — NOT fabricated sports data.
 * Match-level data (teams, groups, fixtures, kickoff times) is never hardcoded
 * here; it is sourced via scripts/seed.ts → data/wc2026.json (see lib/data.ts).
 */
export const TOURNAMENT = {
  name: "FIFA World Cup 2026",
  shortName: "World Cup 2026",
  hosts: ["United States", "Canada", "Mexico"] as const,
  teams: 48,
  groups: 12,
  matches: 104,
  venues: 16,
  /** Calendar window (given fact). Times are unknown until seeded. */
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  openingVenue: "Estadio Azteca, Mexico City",
  finalVenue: "MetLife Stadium, New York/New Jersey",
} as const;

/** India Standard Time — the single timezone the whole app renders in. */
export const IST_TZ = "Asia/Kolkata";

/**
 * Start of opening day in IST, expressed as a UTC instant
 * (2026-06-11T00:00:00+05:30 === 2026-06-10T18:30:00Z).
 * Used as the global countdown anchor ONLY when no opening fixture has been
 * seeded yet — the exact first-whistle time comes from the API once available.
 */
export const OPENING_DAY_IST_ISO = "2026-06-10T18:30:00.000Z";

/** Group ids A..L (12 groups). The members come from seeded data, not here. */
export const GROUP_IDS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
] as const;
export type GroupId = (typeof GROUP_IDS)[number];
