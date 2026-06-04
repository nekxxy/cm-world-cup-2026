// The full 104-match schedule: 72 group games (12 groups × 6) + 32 knockouts.
// Kickoff times are stored in UTC; display them in IST via lib/ist.
// Group pairings come from the real group members; knockout slots are
// placeholders (teams resolved as the bracket fills in).

import { groupFixtures } from "./fixtures";
import type { GroupId } from "./teams";

export type Stage = "group" | "R32" | "R16" | "QF" | "SF" | "3P" | "F";

export interface ScheduleMatch {
  id: string;
  stage: Stage;
  /** Kickoff in UTC ISO. */
  kickoff: string;
  /** Team ids when known (group stage). */
  homeId?: string;
  awayId?: string;
  /** Display label for placeholder knockout fixtures. */
  label?: string;
}

const GROUPS: GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const MD_DATE: Record<1 | 2 | 3, string> = {
  1: "2026-06-14",
  2: "2026-06-20",
  3: "2026-06-26",
};

function groupMatches(): ScheduleMatch[] {
  const out: ScheduleMatch[] = [];
  GROUPS.forEach((g, gi) => {
    const fixtures = groupFixtures(g);
    // 2 matches per matchday; stagger kickoff hours so each has its own slot.
    const perMd: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    fixtures.forEach((f) => {
      const slot = perMd[f.matchday]++;
      const d = new Date(`${MD_DATE[f.matchday]}T00:00:00Z`);
      d.setUTCHours(15 + (gi % 4) * 2 + slot); // 15:00–22:00 UTC window
      out.push({
        id: `G-${g}-${f.home.id}-${f.away.id}`,
        stage: "group",
        kickoff: d.toISOString(),
        homeId: f.home.id,
        awayId: f.away.id,
      });
    });
  });
  return out;
}

function knockoutMatches(): ScheduleMatch[] {
  const plan: [Stage, number, string][] = [
    ["R32", 16, "2026-06-29"],
    ["R16", 8, "2026-07-04"],
    ["QF", 4, "2026-07-09"],
    ["SF", 2, "2026-07-14"],
    ["3P", 1, "2026-07-18"],
    ["F", 1, "2026-07-19"],
  ];
  const out: ScheduleMatch[] = [];
  for (const [stage, count, date] of plan) {
    for (let i = 1; i <= count; i++) {
      const d = new Date(`${date}T00:00:00Z`);
      d.setUTCHours(18 + ((i - 1) % 3) * 1.5 * 2); // spread a bit
      out.push({ id: `${stage}-${i}`, stage, kickoff: d.toISOString(), label: `${stage} · Match ${i}` });
    }
  }
  return out;
}

export const SCHEDULE: ScheduleMatch[] = [...groupMatches(), ...knockoutMatches()];
