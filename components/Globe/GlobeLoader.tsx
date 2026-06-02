"use client";

import { useProgress } from "@react-three/drei";
import { cn } from "@/lib/cn";

/** DOM loader overlay that fades out once the Earth textures finish loading. */
export function GlobeLoader() {
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
        <div className="relative size-16">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
        </div>
        <div className="text-center">
          <p className="font-display text-lg tracking-wide text-text">
            Rendering Earth
          </p>
          <p className="mt-1 text-xs tabular-nums text-dim">
            {Math.min(100, Math.round(progress))}%
          </p>
        </div>
      </div>
    </div>
  );
}
