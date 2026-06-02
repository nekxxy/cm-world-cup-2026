import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Clock, Globe2 } from "lucide-react";
import {
  getMatch,
  getMatches,
  getVenue,
  resolveSides,
  type ResolvedSide,
} from "@/lib/data";
import { STAGE_LABELS } from "@/lib/stages";
import { formatKickoffIST, isLateNightIST } from "@/lib/ist";
import Flag from "@/components/ui/Flag";
import Pill from "@/components/ui/Pill";
import Countdown from "@/components/ui/Countdown";
import StatusPill from "@/components/cards/StatusPill";
import LiveMatchScore from "@/components/LiveMatchScore";

// Only seeded fixture ids exist as pages; any other id is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getMatches().map((m) => ({ id: String(m.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = getMatch(Number(id));
  if (!match) return { title: "Match" };
  const { home, away } = resolveSides(match);
  return { title: `${home.label} vs ${away.label}` };
}

function Side({ side }: { side: ResolvedSide }) {
  return (
    <Link
      href={side.team ? `/teams/${side.team.id}` : "#"}
      className={`flex flex-1 flex-col items-center gap-2 ${
        side.team ? "" : "pointer-events-none"
      }`}
    >
      <Flag team={side.team} size={64} />
      <span className="text-center text-sm font-bold leading-tight text-text">
        {side.label}
      </span>
      {side.team?.code ? (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-dim">
          {side.team.code}
        </span>
      ) : null}
    </Link>
  );
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = getMatch(Number(id));
  if (!match) notFound();

  const { home, away } = resolveSides(match);
  const venue = getVenue(match.venueId);
  const stageLabel =
    match.stage === "group" && match.groupId
      ? `Group ${match.groupId}`
      : STAGE_LABELS[match.stage];

  return (
    <div className="rise-in">
      <Link
        href="/schedule"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-dim hover:text-text"
      >
        <ChevronLeft className="size-4" />
        Schedule
      </Link>

      <div className="mb-4 flex items-center justify-between">
        <Pill tone={match.stage === "group" ? "default" : "accent"}>
          {stageLabel}
        </Pill>
        <StatusPill match={match} />
      </div>

      {/* Matchup */}
      <section className="glass rounded-2xl p-5">
        <div className="flex items-start justify-between gap-2">
          <Side side={home} />
          <div className="px-2 text-center">
            <LiveMatchScore
              matchId={match.id}
              kickoffUtc={match.kickoffUtc}
              initial={{
                status: match.status,
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                minute: match.minute ?? null,
              }}
            />
          </div>
          <Side side={away} />
        </div>

        {match.status === "scheduled" ? (
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-line pt-5">
            <Countdown target={match.kickoffUtc} size="md" />
            <p className="flex items-center gap-1.5 text-sm text-dim">
              <Clock className="size-3.5 text-accent" />
              {formatKickoffIST(match.kickoffUtc)}
              <span className="font-semibold text-accent">IST</span>
            </p>
            {isLateNightIST(match.kickoffUtc) ? (
              <Pill tone="muted">🌙 Late-night watch</Pill>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 border-t border-line pt-4 text-center text-sm text-dim">
            <Clock className="mr-1.5 inline size-3.5 text-accent" />
            {formatKickoffIST(match.kickoffUtc)}{" "}
            <span className="font-semibold text-accent">IST</span>
          </p>
        )}
      </section>

      {/* Venue */}
      {venue ? (
        <section className="glass mt-3 rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                <MapPin className="size-3.5" />
                Venue
              </div>
              <p className="truncate font-semibold text-text">{venue.stadium}</p>
              <p className="text-sm text-dim">
                {venue.city}, {venue.country}
              </p>
            </div>
            <Link
              href={`/globe?venue=${venue.id}`}
              className="glass-2 inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-text"
            >
              <Globe2 className="size-4 text-accent" />
              Globe
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
