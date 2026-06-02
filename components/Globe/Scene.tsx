"use client";

import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { Venue } from "@/lib/types";
import type { DeviceTier } from "@/lib/deviceTier";
import { SUN_DIRECTION } from "./assets";
import { EarthSurface, Clouds } from "./Earth";
import { Atmosphere } from "./Atmosphere";
import { Pins } from "./Pins";
import { Arcs } from "./Arcs";
import { CameraRig } from "./CameraRig";

export function Scene({
  venues,
  accent,
  tier,
  focusPos,
  activeId,
  allowAutoRotate,
  onSelect,
  onHover,
}: {
  venues: Venue[];
  accent: string;
  tier: DeviceTier;
  focusPos: [number, number, number] | null;
  activeId: string | null;
  allowAutoRotate: boolean;
  onSelect: (v: Venue) => void;
  onHover: (v: Venue | null) => void;
}) {
  const high = tier === "high";

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight position={SUN_DIRECTION} intensity={2} />

      <Stars
        radius={80}
        depth={40}
        count={high ? 4000 : 1500}
        factor={4}
        saturation={0}
        fade
        speed={0.3}
      />

      {/* Earth + clouds suspend on their textures; the Canvas-level Suspense
          shows the loader until they're ready. */}
      <EarthSurface />
      {high ? <Clouds /> : null}
      <Atmosphere />

      <Arcs venues={venues} accent={accent} />
      <Pins
        venues={venues}
        accent={accent}
        activeId={activeId}
        onSelect={onSelect}
        onHover={onHover}
      />

      <CameraRig focusPos={focusPos} allowAutoRotate={allowAutoRotate} />

      {high ? (
        <EffectComposer>
          <Bloom
            intensity={0.85}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.7}
          />
        </EffectComposer>
      ) : null}
    </>
  );
}
