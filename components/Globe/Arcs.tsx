"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { Venue } from "@/lib/types";
import { arcPoints } from "@/lib/geo";
import { EARTH_RADIUS } from "./assets";

// A curated web of connections that spans the three host nations without
// cluttering the globe. The opening→final link is highlighted.
const PAIRS: [string, string][] = [
  ["vancouver", "toronto"],
  ["seattle", "boston"],
  ["san-francisco", "new-york-nj"],
  ["los-angeles", "miami"],
  ["monterrey", "dallas"],
  ["guadalajara", "houston"],
  ["kansas-city", "atlanta"],
  ["philadelphia", "los-angeles"],
];

export function Arcs({
  venues,
  accent,
}: {
  venues: Venue[];
  accent: string;
}) {
  const byId = useMemo(
    () => new Map(venues.map((v) => [v.id, v])),
    [venues],
  );

  const arcs = useMemo(() => {
    const list: { points: [number, number, number][]; highlight: boolean }[] =
      [];

    const opening = venues.find((v) => v.opening);
    const final = venues.find((v) => v.final);
    if (opening && final) {
      list.push({
        points: arcPoints(opening, final, EARTH_RADIUS, 64, 0.45),
        highlight: true,
      });
    }

    for (const [a, b] of PAIRS) {
      const va = byId.get(a);
      const vb = byId.get(b);
      if (va && vb) {
        list.push({
          points: arcPoints(va, vb, EARTH_RADIUS, 48, 0.3),
          highlight: false,
        });
      }
    }
    return list;
  }, [venues, byId]);

  return (
    <group>
      {arcs.map((arc, i) => (
        <Line
          key={i}
          points={arc.points}
          color={arc.highlight ? "#f4c04e" : accent}
          lineWidth={arc.highlight ? 2.4 : 1.3}
          transparent
          opacity={arc.highlight ? 0.85 : 0.4}
          toneMapped={false}
          dashed={false}
        />
      ))}
    </group>
  );
}
