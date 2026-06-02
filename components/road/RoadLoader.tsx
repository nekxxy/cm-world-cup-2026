"use client";

import { useProgress } from "@react-three/drei";
import { cn } from "@/lib/cn";

/** Loader overlay that fades out once the scene is ready. */
export function RoadLoader() {
  const { active, progress } = useProgress();
  const done = !active && progress >= 100;

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
