import GlobeClient from "@/components/Globe/GlobeClient";
import type { VenueMeta } from "@/components/Globe/VenueHUD";
import { getVenues, getMatchesByVenue } from "@/lib/data";

export const metadata = { title: "Globe" };

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

  const initialFocusId =
    venue && venues.some((v) => v.id === venue) ? venue : null;

  return (
    <GlobeClient
      venues={venues}
      venueMeta={venueMeta}
      initialFocusId={initialFocusId}
    />
  );
}
