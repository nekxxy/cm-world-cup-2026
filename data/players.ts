// Placeholder player pool, generated deterministically from the 48 teams.
// Real rosters + risograph art drop in later; ids stay stable so saved picks
// survive. Each team contributes a small squad across the four positions.

import { TEAMS, type Team } from "./teams";
import { REAL_SQUADS } from "./realSquads";

export type Position = "GK" | "DEF" | "MID" | "FWD";

export interface Player {
  id: string;
  name: string;
  teamId: string;
  teamCode: string;
  position: Position;
  /** Fantasy price in credits (1 decimal). */
  credits: number;
}

// per-team squad shape and price bands [min, max] by position
const SHAPE: { pos: Position; count: number; band: [number, number] }[] = [
  { pos: "GK", count: 2, band: [4.5, 6.0] },
  { pos: "DEF", count: 5, band: [4.0, 7.5] },
  { pos: "MID", count: 5, band: [5.0, 10.0] },
  { pos: "FWD", count: 3, band: [6.0, 12.5] },
];

// Tiny deterministic hash so prices are stable across builds.
function seed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function buildTeamSquad(team: Team): Player[] {
  const out: Player[] = [];
  const real = REAL_SQUADS[team.id];
  for (const { pos, count, band } of SHAPE) {
    for (let i = 1; i <= count; i++) {
      const id = `${team.id}-${pos}${i}`;
      const r = seed(id);
      // Best player of each position (i === 1) skews toward the top of the band.
      const skew = i === 1 ? 0.75 + r * 0.25 : r;
      const credits = Math.round((band[0] + (band[1] - band[0]) * skew) * 2) / 2; // .0 / .5
      // Real name when curated, else a generated placeholder.
      const name = real?.[pos]?.[i - 1] ?? `${team.code} ${pos}${i}`;
      out.push({ id, name, teamId: team.id, teamCode: team.code, position: pos, credits });
    }
  }
  return out;
}

export const PLAYERS: Player[] = TEAMS.flatMap(buildTeamSquad);

export const PLAYERS_BY_ID: Record<string, Player> = Object.fromEntries(
  PLAYERS.map((p) => [p.id, p]),
);

export function getPlayer(id: string): Player | undefined {
  return PLAYERS_BY_ID[id];
}
