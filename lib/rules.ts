// Fantasy squad rules + validation, shared by the client builder and enforced
// server-side on save (never trust the client).

import { getPlayer, type Position } from "@/data/players";

export const BUDGET = 100.0;
export const SQUAD_SIZE = 11;
export const MAX_PER_TEAM = 3;
export const CAPTAIN_MULTIPLIER = 2;
export const VICE_MULTIPLIER = 1.5;

export const POSITION_LIMITS: Record<Position, { min: number; max: number }> = {
  GK: { min: 1, max: 1 },
  DEF: { min: 3, max: 5 },
  MID: { min: 3, max: 5 },
  FWD: { min: 1, max: 3 },
};

export interface SquadInput {
  players: string[]; // player ids
  captain: string;
  viceCaptain: string;
}

export interface ValidationResult {
  ok: boolean;
  credits: number;
  errors: string[];
}

export function validateSquad(input: SquadInput): ValidationResult {
  const errors: string[] = [];
  const { players, captain, viceCaptain } = input;

  // Resolve players; reject unknown ids.
  const resolved = players.map((id) => getPlayer(id));
  if (resolved.some((p) => !p)) {
    return { ok: false, credits: 0, errors: ["Squad contains an unknown player."] };
  }
  const squad = resolved as NonNullable<(typeof resolved)[number]>[];

  // Size + uniqueness.
  if (squad.length !== SQUAD_SIZE) errors.push(`Pick exactly ${SQUAD_SIZE} players.`);
  if (new Set(players).size !== players.length) errors.push("Duplicate players are not allowed.");

  // Budget.
  const credits = Math.round(squad.reduce((s, p) => s + p.credits, 0) * 10) / 10;
  if (credits > BUDGET) errors.push(`Over budget: ${credits.toFixed(1)} / ${BUDGET.toFixed(1)}.`);

  // Position min/max.
  const byPos: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  squad.forEach((p) => (byPos[p.position] += 1));
  (Object.keys(POSITION_LIMITS) as Position[]).forEach((pos) => {
    const { min, max } = POSITION_LIMITS[pos];
    if (byPos[pos] < min || byPos[pos] > max) {
      errors.push(`${pos}: need ${min}–${max}, have ${byPos[pos]}.`);
    }
  });

  // Max players per real team.
  const byTeam: Record<string, number> = {};
  squad.forEach((p) => (byTeam[p.teamId] = (byTeam[p.teamId] ?? 0) + 1));
  if (Object.values(byTeam).some((n) => n > MAX_PER_TEAM)) {
    errors.push(`Max ${MAX_PER_TEAM} players from any one team.`);
  }

  // Captain / vice must be in the squad and distinct.
  if (!players.includes(captain)) errors.push("Captain must be in your XI.");
  if (!players.includes(viceCaptain)) errors.push("Vice-captain must be in your XI.");
  if (captain && captain === viceCaptain) errors.push("Captain and vice-captain must differ.");

  return { ok: errors.length === 0, credits, errors };
}
