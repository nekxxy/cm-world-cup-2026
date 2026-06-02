import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Bell, Trophy, CalendarPlus } from "lucide-react";
import { getTeam, getTeams, getStandings, getMatchesForTeam } from "@/lib/data";
import { formatKickoffIST } from "@/lib/ist";
import Flag from "@/components/ui/Flag";
import Pill from "@/components/ui/Pill";
import Countdown from "@/components/ui/Countdown";
import MatchCard from "@/components/cards/MatchCard";
import { ButtonLink } from "@/components/ui/Button";

// Only seeded team ids exist as pages; any other id is a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getTeams().map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeam(Number(id));
  return { title: team?.name ?? "Team" };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const team = getTeam(Number(id));
  if (!team) notFound();

  const standings = team.groupId ? getStandings(team.groupId) : [];
  const matches = getMatchesForTeam(team.id);
  const nextMatch = matches.find((m) => m.status === "scheduled");

  return (
    <div className="rise-in">
      <Link
        href="/teams"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-dim hover:text-text"
      >
        <ChevronLeft className="size-4" />
        Teams
      </Link>

      {/* Header */}
      <header className="mb-6 flex items-center gap-4">
        <Flag team={team} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl leading-none tracking-wide text-text">
            {team.name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {team.groupId ? (
              <Pill tone="accent">Group {team.groupId}</Pill>
            ) : (
              <Pill tone="muted">Group TBD</Pill>
            )}
            {team.fifaRank != null ? (
              <Pill tone="muted">FIFA #{team.fifaRank}</Pill>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-2.5">
        <ButtonLink href="/login" variant="glass" className="w-full">
          <Bell className="size-4 text-accent" />
          Log in to follow {team.code ?? team.name} & get reminders
        </ButtonLink>
        {matches.length > 0 ? (
          <a
            href={`/api/ics/${team.id}`}
            className="glass-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-text transition hover:border-white/20"
          >
            <CalendarPlus className="size-4 text-accent" />
            Add fixtures to calendar (.ics)
          </a>
        ) : null}
      </div>

      {/* Next match */}
      {nextMatch ? (
        <section className="mb-6">
          <h2 className="mb-2.5 flex items-center gap-2 font-display text-lg tracking-wide text-text">
            Next match
          </h2>
          <div className="glass mb-2.5 flex flex-col items-center gap-2 rounded-2xl p-4">
            <Countdown target={nextMatch.kickoffUtc} size="md" />
            <p className="text-xs text-dim">
              {formatKickoffIST(nextMatch.kickoffUtc)}{" "}
              <span className="font-semibold text-accent">IST</span>
            </p>
          </div>
          <MatchCard match={nextMatch} />
        </section>
      ) : null}

      {/* Standings */}
      {standings.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-2.5 flex items-center gap-2 font-display text-lg tracking-wide text-text">
            <Trophy className="size-4 text-accent" />
            Group {team.groupId}
          </h2>
          <div className="glass overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wider text-dim">
                  <th className="py-2 pl-3 text-left font-semibold">#</th>
                  <th className="py-2 text-left font-semibold">Team</th>
                  <th className="py-2 text-center font-semibold">P</th>
                  <th className="py-2 text-center font-semibold">GD</th>
                  <th className="py-2 pr-3 text-center font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s) => {
                  const t = getTeam(s.teamId);
                  const isThis = s.teamId === team.id;
                  return (
                    <tr
                      key={s.teamId}
                      className={
                        isThis
                          ? "bg-accent/10"
                          : "border-t border-line/60"
                      }
                    >
                      <td className="py-2 pl-3 text-dim">{s.rank}</td>
                      <td className="py-2">
                        <Link
                          href={`/teams/${s.teamId}`}
                          className="flex items-center gap-2"
                        >
                          <Flag team={t} size={20} />
                          <span
                            className={`truncate ${
                              isThis ? "font-bold text-accent" : "text-text"
                            }`}
                          >
                            {t?.code ?? t?.name ?? "—"}
                          </span>
                        </Link>
                      </td>
                      <td className="py-2 text-center text-dim">{s.played}</td>
                      <td className="py-2 text-center text-dim">
                        {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                      </td>
                      <td className="py-2 pr-3 text-center font-bold text-text">
                        {s.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* All matches */}
      {matches.length > 0 ? (
        <section>
          <h2 className="mb-2.5 font-display text-lg tracking-wide text-text">
            All matches
          </h2>
          <div className="space-y-2.5">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      ) : (
        <p className="text-sm text-dim">
          Fixtures for {team.name} will appear once the schedule is seeded.
        </p>
      )}
    </div>
  );
}
