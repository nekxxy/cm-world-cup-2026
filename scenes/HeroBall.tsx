"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTelegram } from "@/telegram/useTelegram";
import HeroPoster from "./HeroPoster";

// Client-only: the 3D scene must never be server-rendered.
const HeroBallScene = dynamic(() => import("./HeroBallScene"), {
  ssr: false,
  loading: () => null, // poster underneath shows until the chunk + WebGL are up
});

const HEIGHT = 300;

export default function HeroBall({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  const { performanceClass } = useTelegram();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Flat hero on weak devices or when the user asked for less motion.
  const flatOnly = performanceClass === "LOW" || reducedMotion;

  return (
    <div
      style={{
        position: "relative",
        height: HEIGHT,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--color-hairline)",
        background: "var(--color-panel)",
      }}
    >
      {/* Poster always painted first; the canvas (transparent) covers it once
          the ball is drawing, so there's never a blank flash. */}
      <HeroPoster primary={primary} secondary={secondary} />

      {mounted && !flatOnly && (
        <div style={{ position: "absolute", inset: 0 }}>
          <HeroBallScene primary={primary} secondary={secondary} />
        </div>
      )}
    </div>
  );
}
