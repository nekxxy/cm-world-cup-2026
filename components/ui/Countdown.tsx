"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Parts = { d: number; h: number; m: number; s: number; done: boolean };

function diff(targetMs: number): Parts {
  const total = Math.max(0, targetMs - Date.now());
  const s = Math.floor(total / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: total <= 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Ticking D:H:M:S countdown to a UTC target instant.
 * Renders a stable placeholder on the server to avoid hydration mismatch,
 * then hydrates and ticks once per second on the client.
 */
export default function Countdown({
  target,
  size = "md",
  className,
  onDone,
}: {
  target: string | number | Date;
  size?: "sm" | "md" | "lg";
  className?: string;
  onDone?: () => void;
}) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;
    setParts(diff(targetMs));
    const id = setInterval(() => {
      const next = diff(targetMs);
      setParts(next);
      if (next.done) {
        onDone?.();
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs, onDone]);

  const units: { label: string; value: string }[] = [
    { label: "days", value: parts ? String(parts.d) : "—" },
    { label: "hrs", value: parts ? pad(parts.h) : "—" },
    { label: "min", value: parts ? pad(parts.m) : "—" },
    { label: "sec", value: parts ? pad(parts.s) : "—" },
  ];

  const box = {
    sm: "min-w-9 px-1.5 py-1 text-lg",
    md: "min-w-12 px-2 py-1.5 text-2xl",
    lg: "min-w-16 px-2.5 py-2 text-4xl",
  }[size];

  return (
    <div
      className={cn("flex items-stretch gap-1.5", className)}
      role="timer"
      aria-live="off"
    >
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "glass-2 rounded-lg text-center font-display leading-none tabular-nums text-text",
                box,
              )}
            >
              {u.value}
            </div>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-dim">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 ? (
            <span className="-mt-3 font-display text-xl text-dim/50">:</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
