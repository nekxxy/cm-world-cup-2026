import Link from "next/link";
import { Settings, Radio, CalendarClock, Globe2 } from "lucide-react";
import type { Match, Team } from "@/lib/types";
import type { ActiveTheme } from "@/lib/matchday";
import { formatKickoffIST } from "@/lib/ist";
import Countdown from "@/components/ui/Countdown";
import MatchCard from "@/components/cards/MatchCard";
import TeamCard from "@/components/cards/TeamCard";
import Pill from "@/components/ui/Pill";
import { ButtonLink } from "@/components/ui/Button";

export default function FavouritesHub({
  firstName,
  favTeam,
  fav2Team,
  nextMatch,
  today,
  active,
}: {
  firstName: string;
  favTeam: Team;
  fav2Team: Team | null;
  nextMatch: Match | null;
  today: Match[];
  active: ActiveTheme | null;
}) {
  return (
    <div className="rise-in">
      {/* Greeting */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Your World Cup
          </p>
          <h1 className="font-display text-3xl leading-none tracking-wide">
            Hi, {firstName}
          </h1>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="glass-2 grid size-10 place-items-center rounded-full text-dim hover:text-text"
        >
          <Settings className="size-5" />
        </Link>
      </div>

      {/* Match-day banner */}
      {active ? (
        <Link
          href={`/matches/${active.match.id}`}
          className="accent-glow mb-5 flex items-center gap-3 rounded-2xl bg-accent/15 p-4 ring-1 ring-accent/30"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent/20 text-accent">
            <Radio className={active.live ? "size-5 live-dot" : "size-5"} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight tracking-wide text-text">
              {active.live ? "LIVE NOW" : "Match day"}
            </p>
            <p className="truncate text-sm text-dim">
              {active.team.name} {active.live ? "are playing" : "play today"} —
              tap for live
            </p>
          </div>
        </Link>
      ) : null}

      {/* Next match hero */}
      <section className="mb-6">
        <h2 className="mb-2.5 flex items-center gap-2 font-display text-lg tracking-wide">
          <CalendarClock className="size-4 text-accent" />
          Your next match
        </h2>
        {nextMatch ? (
          <div>
            {nextMatch.status === "scheduled" ? (
              <div className="glass mb-2.5 flex flex-col items-center gap-2 rounded-2xl p-4">
                <Countdown target={nextMatch.kickoffUtc} size="md" />
                <p className="text-xs text-dim">
                  {formatKickoffIST(nextMatch.kickoffUtc)}{" "}
                  <span className="font-semibold text-accent">IST</span>
                </p>
              </div>
            ) : null}
            <MatchCard match={nextMatch} />
          </div>
        ) : (
          <p className="glass rounded-2xl p-5 text-center text-sm text-dim">
            No upcoming matches for your teams right now.
          </p>
        )}
      </section>

      {/* Your teams */}
      <section className="mb-6">
        <h2 className="mb-2.5 font-display text-lg tracking-wide">Your teams</h2>
        <div className="grid grid-cols-1 gap-2.5">
          <TeamCard team={favTeam} />
          {fav2Team ? <TeamCard team={fav2Team} /> : null}
        </div>
      </section>

      {/* Tonight */}
      {today.length > 0 ? (
        <section className="mb-6">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="font-display text-lg tracking-wide">Tonight</h2>
            <Pill tone="muted">{today.length} matches</Pill>
          </div>
          <div className="space-y-2.5">
            {today.slice(0, 4).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
          {today.length > 4 ? (
            <Link
              href="/schedule?tab=today"
              className="mt-3 block text-center text-sm font-semibold text-accent"
            >
              See all {today.length} →
            </Link>
          ) : null}
        </section>
      ) : null}

      <ButtonLink href="/globe" variant="glass" size="lg" className="w-full">
        <Globe2 className="size-5 text-accent" />
        Explore the globe
      </ButtonLink>
    </div>
  );
}
