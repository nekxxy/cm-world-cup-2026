"use client";

import type { ThreeEvent } from "@react-three/fiber";
import type { Venue } from "@/lib/types";
import { llToVec3 } from "@/lib/geo";
import { PIN_SURFACE } from "./assets";

const TAP_THRESHOLD = 8; // px of pointer travel — beyond this it's a drag

function pinColor(v: Venue, accent: string) {
  if (v.opening) return "#f4c04e"; // gold — opening match
  if (v.final) return "#ff5da2"; // rose — final
  return accent;
}

function Pin({
  venue,
  accent,
  active,
  onSelect,
  onHover,
}: {
  venue: Venue;
  accent: string;
  active: boolean;
  onSelect: (v: Venue) => void;
  onHover: (v: Venue | null) => void;
}) {
  const pos = llToVec3(venue.lat, venue.lon, PIN_SURFACE);
  const color = pinColor(venue, accent);
  const special = Boolean(venue.opening || venue.final);
  const base = special ? 1.5 : 1;
  const scale = active ? base * 1.8 : base;

  return (
    <group position={pos}>
      {/* Marker */}
      <mesh
        scale={scale}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(venue);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.delta > TAP_THRESHOLD) return; // ignore drags
          onSelect(venue);
        }}
      >
        <sphereGeometry args={[0.013, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Soft halo (glows under bloom) */}
      <mesh scale={scale * 2.6} raycast={() => null}>
        <sphereGeometry args={[0.013, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.16}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function Pins({
  venues,
  accent,
  activeId,
  onSelect,
  onHover,
}: {
  venues: Venue[];
  accent: string;
  activeId: string | null;
  onSelect: (v: Venue) => void;
  onHover: (v: Venue | null) => void;
}) {
  return (
    <group>
      {venues.map((v) => (
        <Pin
          key={v.id}
          venue={v}
          accent={accent}
          active={activeId === v.id}
          onSelect={onSelect}
          onHover={onHover}
        />
      ))}
    </group>
  );
}
