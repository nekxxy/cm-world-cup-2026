"use client";

import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Mode } from "./env";

export function MatchNightToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="glass-2 inline-flex items-center gap-1 rounded-full p-1">
      <button
        onClick={() => onChange("day")}
        aria-pressed={mode === "day"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          mode === "day" ? "bg-accent text-bg" : "text-dim hover:text-text",
        )}
      >
        <Sun className="size-3.5" />
        Golden hour
      </button>
      <button
        onClick={() => onChange("night")}
        aria-pressed={mode === "night"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          mode === "night" ? "bg-accent text-bg" : "text-dim hover:text-text",
        )}
      >
        <Moon className="size-3.5" />
        Match night
      </button>
    </div>
  );
}
