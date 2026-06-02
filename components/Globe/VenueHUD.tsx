"use client";

import Link from "next/link";
import { X, MapPin, CalendarDays } from "lucide-react";
import type { Venue } from "@/lib/types";
import Pill from "@/components/ui/Pill";

export interface VenueMeta {
  count: number;
  firstMatchId: number | null;
}

export function VenueHUD({
  venue,
  meta,
  onClose,
}: {
  venue: Venue;
  meta: VenueMeta;
  onClose: () => void;
}) {
  return (
    <div className="glass-2 pointer-events-auto rounded-2xl p-4 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            {venue.opening ? (
              <Pill tone="gold">Opening match</Pill>
            ) : venue.final ? (
              <Pill tone="accent">The Final</Pill>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <MapPin className="size-3.5" />
                Host city
              </span>
            )}
          </div>
          <h3 className="font-display text-xl leading-tight tracking-wide text-text">
            {venue.city}
          </h3>
          <p className="truncate text-sm text-dim">
            {venue.stadium} · {venue.country}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/5 text-dim hover:text-text"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
        {meta.count > 0 ? (
          <>
            <span className="text-sm text-dim">
              <span className="font-bold text-text">{meta.count}</span> match
              {meta.count === 1 ? "" : "es"} here
            </span>
            {meta.firstMatchId != null ? (
              <Link
                href={`/matches/${meta.firstMatchId}`}
                className="ml-auto inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-semibold text-bg"
              >
                <CalendarDays className="size-4" />
                View fixtures
              </Link>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-dim">
            Fixtures appear here once the schedule is seeded.
          </p>
        )}
      </div>
    </div>
  );
}
