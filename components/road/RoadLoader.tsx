"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { cn } from "@/lib/cn";

/**
 * Loader overlay shown over the hero, then faded out.
 * The road scene is fully procedural, so `useProgress` tracks no assets
 * (`total` stays 0). We therefore treat "no assets" as ready after a brief
 * intro beat, while still waiting on real assets if any are ever added.
 */
export function RoadLoader() {
  const { active, progress, total } = useProgress();
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIntroDone(true), 900);
    return () => clearTimeout(t);
  }, []);

  const loaded = total === 0 ? true : !active && progress >= 100;
  const done = introDone && loaded;

  return (
    <div
      aria-hidden={done}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 grid place-items-center transition-opacity duration-700",
        done ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
        </div>
        <p className="font-display text-sm tracking-[0.2em] text-dim">
          ARRIVING…
        </p>
      </div>
    </div>
  );
}
