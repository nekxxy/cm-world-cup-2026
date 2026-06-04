"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A procedural "trophy" — a gold cup on a base. No GLB needed; it's a few
// primitives, which keeps the lazy chunk tiny. Lit in the team's colours.
function Trophy({ primary, secondary }: { primary: string; secondary: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(dtRaw, 0.05);
    g.rotation.y += 0.3 * dt; // slow idle spin
  });

  const gold = (
    <meshStandardMaterial color="#E8C66B" metalness={0.9} roughness={0.25} />
  );

  return (
    <>
      <group ref={group} position={[0, -0.2, 0]}>
        {/* cup bowl */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.55, 0.32, 0.7, 24]} />
          {gold}
        </mesh>
        {/* stem */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.45, 16]} />
          {gold}
        </mesh>
        {/* base */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.34, 0.4, 0.18, 24]} />
          {gold}
        </mesh>
        {/* handles */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.6, 0.9, 0]} rotation={[0, 0, s * 0.5]}>
            <torusGeometry args={[0.22, 0.05, 12, 24, Math.PI]} />
            {gold}
          </mesh>
        ))}
      </group>

      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 4, 3]} intensity={0.8} color="#fff7e0" />
      <pointLight position={[-3, 1, 2]} intensity={26} distance={14} color={primary} />
      <pointLight position={[3, 0, 3]} intensity={22} distance={14} color={secondary} />
    </>
  );
}

export default function TrophyScene({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <Canvas
      style={{ background: "transparent", touchAction: "pan-y" }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.6, 4], fov: 42 }}
    >
      <Trophy primary={primary} secondary={secondary} />
    </Canvas>
  );
}
