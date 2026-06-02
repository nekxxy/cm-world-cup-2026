"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { City } from "@/lib/cities";
import { CAMERA, type Mode, type Palette } from "./env";
import { RoadScene } from "./RoadScene";

export function RoadCanvas(props: {
  cities: City[];
  palette: Palette;
  mode: Mode;
  activeId: string | null;
  selected: City | null;
  effects: boolean;
  crowdDensity: number;
  accent: string;
  maxDpr: number;
  onHover: (c: City | null) => void;
  onSelect: (c: City) => void;
}) {
  const { maxDpr, ...scene } = props;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      dpr={[1, maxDpr]}
      camera={{ position: CAMERA.position, fov: CAMERA.fov, near: 0.1, far: 120 }}
      frameloop={hidden ? "never" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <RoadScene {...scene} />
      </Suspense>
    </Canvas>
  );
}
