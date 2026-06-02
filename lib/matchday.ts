import { getTeam, getMatchesForTeam } from "./data";
import { istDayKey, istTodayKey } from "./ist";
import { teamAccent } from "./teamColors";
import type { Match, Team } from "./types";

export interface ActiveTheme {
  color: string;
  team: Team;
  match: Match;
  live: boolean;
}

interface Favs {
  favTeamId: number | null;
  fav2TeamId: number | null;
}

/**
 * If a favourite team is live (highest priority) or plays today (IST), return
 * the team + match + its match-day accent colour. Otherwise null (default theme).
 */
export function getActiveFavTheme(user: Favs | null): ActiveTheme | null {
  if (!user) return null;
  const today = istTodayKey();
  const favIds = [user.favTeamId, user.fav2TeamId].filter(
    (x): x is number => x != null,
  );

  let todayMatch: ActiveTheme | null = null;
  for (const id of favIds) {
    const team = getTeam(id);
    if (!team) continue;
    const matches = getMatchesForTeam(id);

    const live = matches.find((m) => m.status === "live");
    if (live) return { color: teamAccent(team), team, match: live, live: true };

    if (!todayMatch) {
      const today_ = matches.find(
        (m) => istDayKey(m.kickoffUtc) === today && m.status !== "finished",
      );
      if (today_) {
        todayMatch = {
          color: teamAccent(team),
          team,
          match: today_,
          live: false,
        };
      }
    }
  }
  return todayMatch;
}
