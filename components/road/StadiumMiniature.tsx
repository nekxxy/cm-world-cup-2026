"use client";

import * as THREE from "three";
import { useMemo } from "react";

/**
 * Low-poly procedural stadium bowl: dark concrete ring, a glowing pitch inside,
 * a luminous rim, and four floodlight masts. No external models.
 */
export function StadiumMiniature({
  position,
  scale = 1,
  rim = "#fff6e0",
  fieldGlow = 0.35,
}: {
  position: [number, number, number];
  scale?: number;
  rim?: string;
  fieldGlow?: number;
}) {
  const masts = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      out.push([Math.cos(a) * 1.02, Math.sin(a) * 1.02]);
    }
    return out;
  }, []);

  return (
    <group position={position} scale={scale}>
      {/* Bowl */}
      <mesh castShadow>
        <cylinderGeometry args={[1.15, 0.92, 0.5, 30, 1, true]} />
        <meshStandardMaterial
          color="#2b313d"
          roughness={0.65}
          metalness={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Lit pitch */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.86, 28]} />
        <meshStandardMaterial
          color="#3fbf73"
          emissive="#2fbf71"
          emissiveIntensity={fieldGlow}
          roughness={0.8}
        />
      </mesh>
      {/* Glowing rim */}
      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.13, 0.03, 8, 30]} />
        <meshBasicMaterial color={rim} toneMapped={false} />
      </mesh>
      {/* Floodlight masts */}
      {masts.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
            <meshStandardMaterial color="#1a1f29" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <boxGeometry args={[0.12, 0.06, 0.03]} />
            <meshBasicMaterial color="#fff6e0" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
