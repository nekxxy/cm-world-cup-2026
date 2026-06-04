// Tournament rounds and their kickoff deadlines. Picks lock at the deadline.

export interface Round {
  id: number;
  name: string;
  /** ISO kickoff of the round's first match — picks lock at/after this. */
  deadline: string;
}

export const ROUNDS: Round[] = [
  { id: 1, name: "Matchday 1", deadline: "2026-06-14T16:00:00Z" },
  { id: 2, name: "Matchday 2", deadline: "2026-06-20T16:00:00Z" },
  { id: 3, name: "Matchday 3", deadline: "2026-06-26T16:00:00Z" },
];

/** The round currently open for edits (first whose deadline hasn't passed). */
export function currentRound(now = new Date()): Round {
  return ROUNDS.find((r) => new Date(r.deadline) > now) ?? ROUNDS[ROUNDS.length - 1];
}

export function getRound(id: number): Round | undefined {
  return ROUNDS.find((r) => r.id === id);
}

export function isLocked(round: Round, now = new Date()): boolean {
  return now >= new Date(round.deadline);
}
