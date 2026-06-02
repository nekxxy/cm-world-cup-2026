import GlobeClient from "@/components/Globe/GlobeClient";
import type { VenueMeta } from "@/components/Globe/VenueHUD";
import ThemeAccent from "@/components/ThemeAccent";
import { getVenues, getMatchesByVenue, getMatchesForTeam } from "@/lib/data";
import { getCurrentUser } from "@/lib/user";
import { getActiveFavTheme } from "@/lib/matchday";

export const metadata = { title: "Globe" };
export const dynamic = "force-dynamic";

export default async function GlobePage({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string }>;
}) {
  const { venue } = await searchParams;
  const venues = getVenues();

  const venueMeta: Record<string, VenueMeta> = {};
  for (const v of venues) {
    const ms = getMatchesByVenue(v.id);
    venueMeta[v.id] = { count: ms.length, firstMatchId: ms[0]?.id ?? null };
  }

  const user = await getCurrentUser();

  // Focus: explicit ?venue, else the favourite team's first-match venue.
  let initialFocusId =
    venue && venues.some((v) => v.id === venue) ? venue : null;
  if (!initialFocusId && user?.favTeamId != null) {
    initialFocusId = getMatchesForTeam(user.favTeamId)[0]?.venueId ?? null;
  }

  // Match-day → retint the globe + overlays to the favourite team's colour.
  const accentOverride = getActiveFavTheme(user)?.color ?? null;

  return (
    <>
      {accentOverride ? <ThemeAccent color={accentOverride} /> : null}
      <GlobeClient
        venues={venues}
        venueMeta={venueMeta}
        initialFocusId={initialFocusId}
        accentOverride={accentOverride}
      />
    </>
  );
}
