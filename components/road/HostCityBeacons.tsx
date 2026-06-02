"use client";

import { useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { City } from "@/lib/cities";
import { GOLD, FLOOD } from "./env";
import { StadiumMiniature } from "./StadiumMiniature";

const ROSE = "#ff5da2";
const TAP = 8;

function beaconColor(c: City) {
  if (c.opening) return GOLD;
  if (c.final) return ROSE;
  return FLOOD;
}

function Beacon({
  city,
  active,
  onHover,
  onSelect,
}: {
  city: City;
  active: boolean;
  onHover: (c: City | null) => void;
  onSelect: (c: City) => void;
}) {
  const col = useRef<THREE.Mesh>(null);
  const orb = useRef<THREE.Mesh>(null);
  const color = beaconColor(city);
  const height = city.opening || city.final ? 3.2 : city.marquee ? 2.6 : 2;
  const [x, z] = city.pos;
  const phase = (x + z) * 1.3;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + phase);
    const mat = col.current?.material as THREE.MeshBasicMaterial | undefined;
    if (mat) mat.opacity = (active ? 0.85 : 0.45) + pulse * 0.25;
    if (orb.current) {
      const s = (active ? 1.5 : 1) * (0.9 + pulse * 0.25);
      orb.current.scale.setScalar(s);
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Light column */}
      <mesh ref={col} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.045, 0.09, height, 10, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Top orb */}
      <mesh ref={orb} position={[0, height, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Ground ring */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.26, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.9 : 0.5}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {city.marquee ? (
        <StadiumMiniature
          position={[0, 0, 0]}
          scale={0.42}
          rim={color}
          fieldGlow={active ? 0.7 : 0.35}
        />
      ) : null}
      {/* Invisible hit target */}
      <mesh
        position={[0, height / 2, 0]}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(city);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.delta > TAP) return;
          onSelect(city);
        }}
      >
        <cylinderGeometry args={[0.5, 0.5, height + 0.5, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function HostCityBeacons({
  cities,
  activeId,
  onHover,
  onSelect,
}: {
  cities: City[];
  activeId: string | null;
  onHover: (c: City | null) => void;
  onSelect: (c: City) => void;
}) {
  return (
    <group>
      {cities.map((c) => (
        <Beacon
          key={c.id}
          city={c}
          active={activeId === c.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
