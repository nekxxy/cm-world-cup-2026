import type { Match } from "@/lib/types";
import { istWeekday, istDayMonth } from "@/lib/ist";
import Pill from "@/components/ui/Pill";

/** Compact match-status indicator: LIVE (with minute), FT, or the IST date. */
export default function StatusPill({ match }: { match: Match }) {
  if (match.status === "live") {
    return (
      <Pill tone="live">
        <span className="live-dot inline-block size-1.5 rounded-full bg-live" />
        Live{match.minute != null ? ` ${match.minute}'` : ""}
      </Pill>
    );
  }
  if (match.status === "finished") {
    return <Pill tone="muted">Full time</Pill>;
  }
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wide text-dim">
      {istWeekday(match.kickoffUtc)} {istDayMonth(match.kickoffUtc)}
    </span>
  );
}
