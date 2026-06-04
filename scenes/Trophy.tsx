"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTelegram } from "@/telegram/useTelegram";
import { useNearViewport } from "./scroll/useNearViewport";
import HeroPoster from "./HeroPoster";

// Client-only, and only imported once the section nears the viewport.
const TrophyScene = dynamic(() => import("./TrophyScene"), {
  ssr: false,
  loading: () => null,
});

export default function Trophy({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  const { performanceClass } = useTelegram();
  const [reducedMotion, setReducedMotion] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const flatOnly = performanceClass === "LOW" || reducedMotion;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        height: 320,
        maxWidth: 360,
      }}
    >
      <HeroPoster primary={primary} secondary={secondary} />
      {/* Mount only while near; unmounting tears the GL context down. */}
      {!flatOnly && near && (
        <div style={{ position: "absolute", inset: 0 }}>
          <TrophyScene primary={primary} secondary={secondary} />
        </div>
      )}
    </div>
  );
}
