"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ATMOSPHERE_RADIUS } from "./assets";
import { ATMOSPHERE_FRAGMENT, ATMOSPHERE_VERTEX } from "./shaders";

export function Atmosphere({ color = "#3aa0ff" }: { color?: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          glowColor: { value: new THREE.Color(color) },
          intensity: { value: 1.1 },
          power: { value: 3.2 },
        },
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [color],
  );

  return (
    <mesh scale={ATMOSPHERE_RADIUS}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
