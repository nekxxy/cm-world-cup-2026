"use client";

import { useEffect, useState } from "react";
import type { MatchStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

interface LiveState {
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
}

interface LiveApiMatch extends LiveState {
  id: number;
}

const WINDOW = 3 * 60 * 60 * 1000; // poll within ±3h of kickoff

/**
 * Score display that polls the cached /api/live layer around match time,
 * updating the scoreline in place. The static page ships seed state; the
 * client decides whether to poll based on the real clock vs kickoff.
 */
export default function LiveMatchScore({
  matchId,
  kickoffUtc,
  initial,
}: {
  matchId: number;
  kickoffUtc: string;
  initial: LiveState;
}) {
  const [s, setS] = useState<LiveState>(initial);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const near = () => Math.abs(Date.parse(kickoffUtc) - Date.now()) < WINDOW;

    const tick = async () => {
      try {
        const res = await fetch("/api/live", { cache: "no-store" });
        const data = (await res.json()) as { matches?: LiveApiMatch[] };
        const m = data.matches?.find((x) => x.id === matchId);
        if (m && active) {
          setS({
            status: m.status,
            homeScore: m.homeScore,
            awayScore: m.awayScore,
            minute: m.minute,
          });
        }
      } catch {
        /* keep last known */
      }
    };

    if (s.status !== "finished" && near()) {
      tick();
      timer = setInterval(tick, 30_000);
    }
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, kickoffUtc]);

  if (s.status === "scheduled") {
    return <div className="font-display text-3xl text-dim/50">VS</div>;
  }

  return (
    <div>
      <div
        className={cn(
          "font-display text-5xl leading-none tabular-nums",
          s.status === "live" ? "text-accent" : "text-text",
        )}
      >
        {s.homeScore ?? 0}
        <span className="px-1 text-dim">–</span>
        {s.awayScore ?? 0}
      </div>
      {s.status === "live" ? (
        <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wide text-live">
          <span className="live-dot inline-block size-1.5 rounded-full bg-live" />
          {s.minute != null ? `${s.minute}'` : "Live"}
        </div>
      ) : null}
    </div>
  );
}
