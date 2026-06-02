"use client";

import { MapPin } from "lucide-react";
import type { Venue } from "@/lib/types";
import { cn } from "@/lib/cn";

function project(lat: number, lon: number) {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  };
}

function dotColor(v: Venue) {
  if (v.opening) return "bg-gold";
  if (v.final) return "bg-[#ff5da2]";
  return "bg-accent";
}

export function Globe2DFallback({
  venues,
  activeId,
  onSelect,
}: {
  venues: Venue[];
  activeId: string | null;
  onSelect: (v: Venue) => void;
}) {
  return (
    <div className="rise-in">
      {/* Projected map */}
      <div
        className="glass relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: "2 / 1" }}
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "8.33% 16.66%",
          }}
        />
        {venues.map((v) => {
          const p = project(v.lat, v.lon);
          const active = activeId === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelect(v)}
              aria-label={`${v.city} — ${v.stadium}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={p}
            >
              <span
                className={cn(
                  "block rounded-full ring-2 ring-bg transition",
                  dotColor(v),
                  v.opening || v.final ? "size-3" : "size-2",
                  active && "scale-150",
                )}
              />
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-center text-xs text-dim">
        2D view · your device skips the 3D globe for smooth performance.
      </p>

      {/* Venue list */}
      <ul className="mt-4 space-y-2">
        {venues.map((v) => (
          <li key={v.id}>
            <button
              onClick={() => onSelect(v)}
              className={cn(
                "glass flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:border-white/20",
                activeId === v.id && "ring-1 ring-accent/40",
              )}
            >
              <span className={cn("size-2.5 shrink-0 rounded-full", dotColor(v))} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text">
                  {v.city}
                </span>
                <span className="block truncate text-xs text-dim">
                  {v.stadium} · {v.country}
                </span>
              </span>
              {v.opening ? (
                <span className="text-[10px] font-bold uppercase tracking-wide text-gold">
                  Opening
                </span>
              ) : v.final ? (
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#ff5da2]">
                  Final
                </span>
              ) : (
                <MapPin className="size-4 text-dim" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
