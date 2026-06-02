import Link from "next/link";
import { STAGE_ORDER, STAGE_SHORT } from "@/lib/stages";
import { cn } from "@/lib/cn";

export type ScheduleTab = "live" | "today" | "upcoming" | "results" | "all";

export interface ScheduleQuery {
  tab: ScheduleTab;
  stage: string; // "all" | Stage
  group: string; // "all" | "A".."L"
}

const TABS: { key: ScheduleTab; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "today", label: "Today" },
  { key: "upcoming", label: "Upcoming" },
  { key: "results", label: "Results" },
  { key: "all", label: "All" },
];

function href(current: ScheduleQuery, patch: Partial<ScheduleQuery>) {
  const q = { ...current, ...patch };
  const params = new URLSearchParams();
  if (q.tab !== "upcoming") params.set("tab", q.tab);
  if (q.stage !== "all") params.set("stage", q.stage);
  if (q.group !== "all") params.set("group", q.group);
  const s = params.toString();
  return s ? `/schedule?${s}` : "/schedule";
}

const chip =
  "min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition flex items-center gap-1.5";

export default function ScheduleFilters({
  query,
  counts,
  groups,
  showGroups,
}: {
  query: ScheduleQuery;
  counts: Record<ScheduleTab, number>;
  groups: string[];
  showGroups: boolean;
}) {
  return (
    <div className="mb-5 space-y-2.5">
      {/* Tabs */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {TABS.map((t) => {
          const active = query.tab === t.key;
          const count = counts[t.key];
          return (
            <Link
              key={t.key}
              href={href(query, { tab: t.key })}
              aria-current={active ? "page" : undefined}
              className={cn(
                chip,
                active
                  ? "bg-accent text-bg"
                  : "glass-2 text-dim hover:text-text",
                t.key === "live" && count > 0 && !active && "text-live",
              )}
            >
              {t.key === "live" && count > 0 ? (
                <span className="live-dot inline-block size-1.5 rounded-full bg-live" />
              ) : null}
              {t.label}
              {count > 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px]",
                    active ? "bg-black/15" : "bg-white/10",
                  )}
                >
                  {count}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>

      {/* Stage filter */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Link
          href={href(query, { stage: "all", group: "all" })}
          className={cn(
            chip,
            query.stage === "all"
              ? "bg-surface2 text-text ring-1 ring-white/15"
              : "text-dim hover:text-text",
          )}
        >
          All stages
        </Link>
        {STAGE_ORDER.map((s) => (
          <Link
            key={s}
            href={href(query, {
              stage: s,
              group: s === "group" ? query.group : "all",
            })}
            className={cn(
              chip,
              query.stage === s
                ? "bg-surface2 text-text ring-1 ring-white/15"
                : "text-dim hover:text-text",
            )}
          >
            {STAGE_SHORT[s]}
          </Link>
        ))}
      </div>

      {/* Group filter (group stage only) */}
      {showGroups && groups.length > 0 ? (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          <Link
            href={href(query, { group: "all" })}
            className={cn(
              chip,
              query.group === "all"
                ? "bg-surface2 text-text ring-1 ring-white/15"
                : "text-dim hover:text-text",
            )}
          >
            All groups
          </Link>
          {groups.map((g) => (
            <Link
              key={g}
              href={href(query, { group: g })}
              className={cn(
                chip,
                query.group === g
                  ? "bg-surface2 text-text ring-1 ring-white/15"
                  : "text-dim hover:text-text",
              )}
            >
              {g}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
