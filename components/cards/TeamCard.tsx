import Link from "next/link";
import type { Team } from "@/lib/types";
import Flag from "@/components/ui/Flag";
import { cn } from "@/lib/cn";

export default function TeamCard({
  team,
  className,
}: {
  team: Team;
  className?: string;
}) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className={cn(
        "glass flex items-center gap-3 rounded-2xl p-3 transition hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        className,
      )}
    >
      <Flag team={team} size={40} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-text">{team.name}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-dim">
          {team.groupId ? (
            <span className="font-semibold uppercase tracking-wide text-accent">
              Group {team.groupId}
            </span>
          ) : (
            <span>Group TBD</span>
          )}
          {team.fifaRank != null ? <span>· FIFA #{team.fifaRank}</span> : null}
        </div>
      </div>
    </Link>
  );
}
