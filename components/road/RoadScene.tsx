"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import type { City } from "@/lib/cities";
import { CAMERA, FLOOD, type Mode, type Palette } from "./env";
import { Pitch } from "./Pitch";
import { HostCityBeacons } from "./HostCityBeacons";
import { RouteLines } from "./RouteLines";
import { CrowdLights } from "./CrowdLights";
import { Football } from "./Football";

function CameraRig({ selected }: { selected: City | null }) {
  const { camera, pointer } = useThree();
  const look = useRef(new THREE.Vector3(...CAMERA.target));
  const dest = useRef(new THREE.Vector3());
  const destLook = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (selected) {
      dest.current.set(selected.pos[0], 3.3, selected.pos[1] + 5.6);
      destLook.current.set(selected.pos[0], 0.6, selected.pos[1]);
    } else {
      const driftX = Math.sin(t * 0.12) * 1.7 + pointer.x * 1.5;
      const driftY = CAMERA.position[1] + Math.sin(t * 0.16) * 0.4 - pointer.y * 0.7;
      dest.current.set(
        CAMERA.position[0] + driftX,
        Math.max(2.4, driftY),
        CAMERA.position[2],
      );
      destLook.current.set(...CAMERA.target);
    }
    const k = 1 - Math.pow(0.0016, delta);
    camera.position.lerp(dest.current, k);
    look.current.lerp(destLook.current, k);
    camera.lookAt(look.current);
  });
  return null;
}

export function RoadScene({
  cities,
  palette,
  mode,
  activeId,
  selected,
  effects,
  crowdDensity,
  accent,
  onHover,
  onSelect,
}: {
  cities: City[];
  palette: Palette;
  mode: Mode;
  activeId: string | null;
  selected: City | null;
  effects: boolean;
  crowdDensity: number;
  accent: string;
  onHover: (c: City | null) => void;
  onSelect: (c: City) => void;
}) {
  const beams = cities.filter((c) => c.marquee);

  return (
    <>
      <fogExp2 attach="fog" args={[palette.fog, palette.fogDensity]} />
      <color attach="background" args={[palette.sky]} />

      <hemisphereLight args={[palette.sky, "#070b12", palette.hemi]} />
      <ambientLight intensity={palette.ambient} />
      <directionalLight
        color={palette.key}
        intensity={palette.keyIntensity}
        position={palette.keyPos}
      />
      {/* cool rim from behind */}
      <directionalLight color="#7d94ff" intensity={mode === "night" ? 0.5 : 0.25} position={[-6, 4, -8]} />

      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={mode === "night" ? 1.1 : 2.2}
          color={mode === "night" ? "#9fb6ff" : "#ffd9a0"}
          position={[0, 6, -5]}
          scale={[14, 7, 1]}
        />
        <Lightformer
          intensity={1}
          color="#2fbf71"
          position={[0, -3, 3]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 6, 1]}
        />
        <Lightformer intensity={0.8} color="#5b7cff" position={[-9, 3, -2]} scale={[3, 7, 1]} />
      </Environment>

      <Pitch grass={palette.grass} />

      <RouteLines cities={cities} accent={accent} />
      <HostCityBeacons
        cities={cities}
        activeId={activeId}
        onHover={onHover}
        onSelect={onSelect}
      />
      <CrowdLights cities={cities} count={crowdDensity} />
      <Football />

      {/* Floodlight beams cutting the haze (stronger at night) */}
      {beams.map((c) => (
        <mesh key={c.id} position={[c.pos[0], 1.9, c.pos[1]]}>
          <coneGeometry args={[0.95, 3.6, 24, 1, true]} />
          <meshBasicMaterial
            color={FLOOD}
            transparent
            opacity={palette.beam}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}

      <ContactShadows
        position={[0, 0.012, 5]}
        scale={46}
        blur={2.6}
        far={14}
        opacity={mode === "night" ? 0.55 : 0.38}
        color="#040608"
      />

      <CameraRig selected={selected} />

      {effects ? (
        <EffectComposer>
          <Bloom
            intensity={palette.bloom}
            luminanceThreshold={0.28}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.7}
          />
          <Vignette eskil={false} offset={0.28} darkness={0.85} />
          <Noise opacity={0.035} />
        </EffectComposer>
      ) : null}
    </>
  );
}
