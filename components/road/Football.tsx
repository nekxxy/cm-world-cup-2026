"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** A clean, premium PBR match ball resting on the pitch in the foreground. */
export function Football({
  position = [2.6, 0.62, 9],
  radius = 0.62,
}: {
  position?: [number, number, number];
  radius?: number;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={group} position={position} castShadow>
      <mesh castShadow>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshPhysicalMaterial
          color="#f7f8fa"
          roughness={0.34}
          metalness={0}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          sheen={0.4}
          sheenColor="#ffe8c0"
          envMapIntensity={1.1}
        />
      </mesh>
      {/* Subtle seam */}
      <mesh rotation={[Math.PI / 2.4, 0.5, 0]}>
        <torusGeometry args={[radius * 1.001, 0.012, 8, 64]} />
        <meshStandardMaterial color="#23262d" roughness={0.5} />
      </mesh>
    </group>
  );
}
