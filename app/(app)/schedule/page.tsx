import { CalendarDays, SearchX } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import MatchCard from "@/components/cards/MatchCard";
import ScheduleFilters, {
  type ScheduleQuery,
  type ScheduleTab,
} from "@/components/schedule/ScheduleFilters";
import { getMatches, getGroups } from "@/lib/data";
import { STAGE_ORDER } from "@/lib/stages";
import type { Match, Stage } from "@/lib/types";
import { groupByISTDay, istDayKey, istTodayKey } from "@/lib/ist";
import { TOURNAMENT } from "@/lib/constants";

export const metadata = { title: "Schedule" };
// Request-time render so "Today / Upcoming / Live" reflect the real clock.
export const dynamic = "force-dynamic";

const TABS: ScheduleTab[] = ["live", "today", "upcoming", "results", "all"];

function matchesForTab(all: Match[], tab: ScheduleTab, todayKey: string): Match[] {
  switch (tab) {
    case "live":
      return all.filter((m) => m.status === "live");
    case "today":
      return all.filter((m) => istDayKey(m.kickoffUtc) === todayKey);
    case "upcoming":
      return all.filter((m) => m.status === "scheduled");
    case "results":
      return all.filter((m) => m.status === "finished");
    default:
      return all;
  }
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; stage?: string; group?: string }>;
}) {
  const sp = await searchParams;
  const all = getMatches();
  const groups = getGroups().map((g) => g.id);
  const todayKey = istTodayKey();

  // Seed-pending: no fixtures at all.
  if (all.length === 0) {
    return (
      <div className="rise-in">
        <PageHeader
          kicker={`${TOURNAMENT.matches} matches · IST`}
          title="Schedule"
          subtitle="Every fixture, grouped by night (Asia/Kolkata)."
        />
        <EmptyState
          Icon={CalendarDays}
          title="Fixtures not seeded yet"
          description="Run `npm run seed` with an API-Football key to load all 104 fixtures. Kickoffs will appear here in IST, grouped by night."
        />
      </div>
    );
  }

  // Normalise query.
  const tab: ScheduleTab = TABS.includes(sp.tab as ScheduleTab)
    ? (sp.tab as ScheduleTab)
    : "upcoming";
  const stage: string =
    sp.stage && STAGE_ORDER.includes(sp.stage as Stage) ? sp.stage : "all";
  const group: string =
    sp.group && groups.includes(sp.group) ? sp.group : "all";
  const query: ScheduleQuery = { tab, stage, group };

  const counts = Object.fromEntries(
    TABS.map((t) => [t, matchesForTab(all, t, todayKey).length]),
  ) as Record<ScheduleTab, number>;

  let filtered = matchesForTab(all, tab, todayKey);
  if (stage !== "all") filtered = filtered.filter((m) => m.stage === stage);
  if (group !== "all") filtered = filtered.filter((m) => m.groupId === group);

  let days = groupByISTDay(filtered, (m) => m.kickoffUtc, todayKey);
  if (tab === "results") days = days.reverse();

  const showGroups = stage === "all" || stage === "group";

  return (
    <div className="rise-in">
      <PageHeader
        kicker={`${TOURNAMENT.matches} matches · IST`}
        title="Schedule"
        subtitle="Grouped by night (Asia/Kolkata)."
      />

      <ScheduleFilters
        query={query}
        counts={counts}
        groups={groups}
        showGroups={showGroups}
      />

      {filtered.length === 0 ? (
        <EmptyState
          Icon={SearchX}
          title="No matches here"
          description="Nothing matches this filter right now. Try another tab or stage."
        />
      ) : (
        <div className="space-y-7">
          {days.map((day) => (
            <section key={day.key}>
              <div className="mb-2.5 flex items-baseline justify-between">
                <h2 className="font-display text-lg tracking-wide text-text">
                  {day.heading}
                </h2>
                <span className="text-xs font-semibold uppercase tracking-wider text-dim">
                  {day.dateLabel}
                </span>
              </div>
              <div className="space-y-2.5">
                {day.items.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
