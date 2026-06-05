"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// A realistic-ish FIFA World Cup trophy, built procedurally (no external asset):
// a lathe-revolved spiral body that flares at the base, narrows, and opens to
// cradle a golden globe on top. Gold PBR + image-based reflections + slow
// cinematic spin.
function Trophy({ primary, secondary }: { primary: string; secondary: string }) {
  const group = useRef<THREE.Group>(null);

  // Silhouette profile (x = radius, y = height) revolved around Y.
  const points = useMemo(() => {
    const p: [number, number][] = [
      [0.0, 0.0],
      [0.55, 0.0],
      [0.52, 0.1],
      [0.32, 0.32],
      [0.2, 0.62],
      [0.15, 1.0],
      [0.15, 1.45],
      [0.19, 1.85],
      [0.3, 2.15],
      [0.45, 2.42],
      [0.5, 2.6],
      [0.42, 2.72],
      [0.28, 2.78],
    ];
    return p.map(([x, y]) => new THREE.Vector2(x, y));
  }, []);

  useFrame((_, dtRaw) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += Math.min(dtRaw, 0.05) * 0.45; // slow, steady
  });

  const gold = <meshStandardMaterial color="#F2C14E" metalness={1} roughness={0.22} envMapIntensity={1.4} />;

  return (
    <>
      <group ref={group} position={[0, -1.5, 0]}>
        {/* trophy body */}
        <mesh castShadow>
          <latheGeometry args={[points, 64]} />
          {gold}
        </mesh>
        {/* the globe it holds */}
        <mesh position={[0, 3.05, 0]} castShadow>
          <sphereGeometry args={[0.42, 48, 48]} />
          <meshStandardMaterial color="#E8B53A" metalness={1} roughness={0.28} envMapIntensity={1.4} />
        </mesh>
        {/* dark plinth */}
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.62, 0.66, 0.24, 48]} />
          <meshStandardMaterial color="#1b1b1f" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 6, 4]} intensity={1.1} color="#fff6e0" castShadow />
      <pointLight position={[-3, 1, 2]} intensity={22} distance={14} color={primary} />
      <pointLight position={[3, -1, 3]} intensity={16} distance={14} color={secondary} />

      {/* Image-based lighting for believable gold reflections (no asset fetch). */}
      <Environment resolution={128}>
        <Lightformer intensity={2} position={[0, 3, 3]} scale={6} color="#ffffff" />
        <Lightformer intensity={1} position={[-4, 1, 2]} scale={3} color={primary} />
        <Lightformer intensity={1} position={[4, 0, 2]} scale={3} color={secondary} />
        <Lightformer intensity={0.6} position={[0, -3, 1]} scale={5} color="#fff2cc" />
      </Environment>

      <ContactShadows position={[0, -1.62, 0]} opacity={0.55} scale={7} blur={2.8} far={4} frames={1} />
    </>
  );
}

export default function TrophyScene({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <Canvas
      style={{ background: "transparent", touchAction: "pan-y" }}
      dpr={[1, 1.5]}
      shadows
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.4, 5], fov: 40 }}
    >
      <Trophy primary={primary} secondary={secondary} />
    </Canvas>
  );
}
