import type { Match } from "@/lib/types";
import { getCurrentUser } from "@/lib/user";
import {
  getTeam,
  getMatchesForTeam,
  getMatches,
  hasTeamData,
} from "@/lib/data";
import { istDayKey, istTodayKey } from "@/lib/ist";
import { getActiveFavTheme } from "@/lib/matchday";
import CinematicLanding from "@/components/road/CinematicLanding";
import FavouritesHub from "@/components/home/FavouritesHub";
import ThemeAccent from "@/components/ThemeAccent";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  // Signed out, no favourites yet, or no seeded teams → the cinematic
  // "Road to 2026" arrival experience.
  if (!user || user.favTeamId == null || !hasTeamData()) {
    return <CinematicLanding />;
  }

  const favTeam = getTeam(user.favTeamId);
  if (!favTeam) return <CinematicLanding />;
  const fav2Team = getTeam(user.fav2TeamId) ?? null;

  // Soonest live/scheduled match across both favourites.
  const ids = [user.favTeamId, user.fav2TeamId].filter(
    (x): x is number => x != null,
  );
  const seen = new Set<number>();
  const mine: Match[] = [];
  for (const id of ids) {
    for (const m of getMatchesForTeam(id)) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        mine.push(m);
      }
    }
  }
  mine.sort((a, b) => Date.parse(a.kickoffUtc) - Date.parse(b.kickoffUtc));
  const nextMatch =
    mine.find((m) => m.status === "live") ??
    mine.find((m) => m.status === "scheduled") ??
    null;

  const todayKey = istTodayKey();
  const todays = getMatches().filter((m) => istDayKey(m.kickoffUtc) === todayKey);

  const active = getActiveFavTheme(user);

  return (
    <>
      {active ? <ThemeAccent color={active.color} /> : null}
      <FavouritesHub
        firstName={user.firstName}
        favTeam={favTeam}
        fav2Team={fav2Team}
        nextMatch={nextMatch}
        today={todays}
        active={active}
      />
    </>
  );
}
