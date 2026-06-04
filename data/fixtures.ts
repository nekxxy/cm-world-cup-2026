// Group-stage fixtures derived from the 4 teams in a group (single round-robin
// = 3 matchdays of 2 games). Illustrative dates within the group-stage window;
// the real schedule slots in later.

import { TEAMS, type GroupId, type Team } from "./teams";

export interface Fixture {
  matchday: 1 | 2 | 3;
  home: Team;
  away: Team;
  /** Display date label (provisional). */
  date: string;
}

const MATCHDAY_DATES: Record<1 | 2 | 3, string> = {
  1: "Jun 14, 2026",
  2: "Jun 20, 2026",
  3: "Jun 26, 2026",
};

export function teamsInGroup(group: GroupId): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

export function groupFixtures(group: GroupId): Fixture[] {
  const [a, b, c, d] = teamsInGroup(group);
  if (!a || !b || !c || !d) return [];
  const pairs: [Team, Team, 1 | 2 | 3][] = [
    [a, b, 1], [c, d, 1],
    [a, c, 2], [b, d, 2],
    [a, d, 3], [b, c, 3],
  ];
  return pairs.map(([home, away, matchday]) => ({
    matchday,
    home,
    away,
    date: MATCHDAY_DATES[matchday],
  }));
}
