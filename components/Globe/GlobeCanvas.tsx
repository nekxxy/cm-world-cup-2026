"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { Venue } from "@/lib/types";
import type { DeviceTier } from "@/lib/deviceTier";
import { Scene } from "./Scene";

export function GlobeCanvas(props: {
  venues: Venue[];
  accent: string;
  tier: DeviceTier;
  focusPos: [number, number, number] | null;
  activeId: string | null;
  allowAutoRotate: boolean;
  onSelect: (v: Venue) => void;
  onHover: (v: Venue | null) => void;
}) {
  // Pause rendering entirely when the tab is hidden (battery/perf budget).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const maxDpr = props.tier === "high" ? 2 : 1.5;

  return (
    <Canvas
      dpr={[1, maxDpr]}
      camera={{ position: [0, 0.55, 2.6], fov: 42, near: 0.1, far: 100 }}
      frameloop={hidden ? "never" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05060b"]} />
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
