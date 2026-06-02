import Link from "next/link";
import type { Match } from "@/lib/types";
import { resolveSides, getVenue } from "@/lib/data";
import { STAGE_LABELS } from "@/lib/stages";
import { istTime } from "@/lib/ist";
import { cn } from "@/lib/cn";
import Flag from "@/components/ui/Flag";
import Pill from "@/components/ui/Pill";
import StatusPill from "./StatusPill";

export default function MatchCard({
  match,
  className,
}: {
  match: Match;
  className?: string;
}) {
  const { home, away } = resolveSides(match);
  const venue = getVenue(match.venueId);
  const showScore = match.status !== "scheduled";
  const stageLabel =
    match.stage === "group" && match.groupId
      ? `Group ${match.groupId}`
      : STAGE_LABELS[match.stage];

  return (
    <Link
      href={`/matches/${match.id}`}
      aria-label={`${home.label} vs ${away.label}, ${stageLabel}`}
      className={cn(
        "glass block rounded-2xl p-3.5 transition hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        match.status === "live" && "ring-1 ring-live/30",
        className,
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <Pill tone={match.stage === "group" ? "default" : "accent"}>
          {stageLabel}
        </Pill>
        <StatusPill match={match} />
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Home */}
        <div className="flex min-w-0 items-center gap-2">
          <Flag team={home.team} size={26} />
          <span className="truncate text-sm font-semibold text-text">
            {home.label}
          </span>
        </div>

        {/* Center: score or kickoff */}
        <div className="px-1 text-center">
          {showScore ? (
            <div
              className={cn(
                "font-display text-2xl leading-none tabular-nums",
                match.status === "live" ? "text-accent" : "text-text",
              )}
            >
              {match.homeScore ?? 0}
              <span className="px-1 text-dim">–</span>
              {match.awayScore ?? 0}
            </div>
          ) : (
            <div className="leading-none">
              <div className="font-display text-xl tabular-nums text-text">
                {istTime(match.kickoffUtc)}
              </div>
              <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                IST
              </div>
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-semibold text-text">
            {away.label}
          </span>
          <Flag team={away.team} size={26} />
        </div>
      </div>

      {venue ? (
        <p className="mt-2.5 truncate text-center text-[11px] text-dim">
          {venue.stadium} · {venue.city}
        </p>
      ) : null}
    </Link>
  );
}
