"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { City } from "@/lib/cities";
import { GROUND, FLOOD } from "./env";

/** Distant crowd / city-glow specks clustered around each host city. */
export function CrowdLights({
  cities,
  count = 1,
}: {
  cities: City[];
  /** Density multiplier (lower on weaker devices). */
  count?: number;
}) {
  const positions = useMemo(() => {
    const arr: number[] = [];
    for (const c of cities) {
      const n = Math.round((c.marquee ? 90 : 48) * count);
      for (let i = 0; i < n; i++) {
        const r = Math.random() * 1.7;
        const a = Math.random() * Math.PI * 2;
        arr.push(
          c.pos[0] + Math.cos(a) * r,
          0.05 + Math.random() * 0.4,
          c.pos[1] + Math.sin(a) * r,
        );
      }
    }
    for (let i = 0; i < 280 * count; i++) {
      arr.push(
        (Math.random() - 0.5) * GROUND.width * 0.9,
        0.03 + Math.random() * 0.18,
        (Math.random() - 0.5) * GROUND.depth * 0.9,
      );
    }
    return new Float32Array(arr);
  }, [cities, count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        sizeAttenuation
        color={FLOOD}
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
