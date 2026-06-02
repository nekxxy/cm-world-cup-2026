"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CAMERA, type Palette } from "./env";
import { RoadScene } from "./RoadScene";

export function RoadCanvas({
  palette,
  effects,
  reflectiveFloor,
  maxDpr,
}: {
  palette: Palette;
  effects: boolean;
  reflectiveFloor: boolean;
  maxDpr: number;
}) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <Canvas
      dpr={[1, maxDpr]}
      camera={{ position: CAMERA.position, fov: CAMERA.fov, near: 0.1, far: 100 }}
      frameloop={hidden ? "never" : "always"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      // Vertical gestures scroll the page; horizontal gestures spin the ball.
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        <RoadScene
          palette={palette}
          effects={effects}
          reflectiveFloor={reflectiveFloor}
        />
      </Suspense>
    </Canvas>
  );
}
