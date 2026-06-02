"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import type { City } from "@/lib/cities";
import { GOLD } from "./env";

type P3 = [number, number, number];

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

function arc(a: [number, number], b: [number, number], seg = 44): P3[] {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const dist = Math.hypot(dx, dz);
  const lift = Math.min(3.2, 0.6 + dist * 0.28);
  const pts: P3[] = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    pts.push([
      a[0] + dx * t,
      Math.sin(Math.PI * t) * lift + 0.06,
      a[1] + dz * t,
    ]);
  }
  return pts;
}

export function RouteLines({
  cities,
  accent,
}: {
  cities: City[];
  accent: string;
}) {
  const byId = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);

  const lines = useMemo(() => {
    const out: { points: P3[]; highlight: boolean }[] = [];
    const opening = cities.find((c) => c.opening);
    const final = cities.find((c) => c.final);
    if (opening && final) {
      out.push({ points: arc(opening.pos, final.pos, 60), highlight: true });
    }
    for (const [a, b] of PAIRS) {
      const ca = byId.get(a);
      const cb = byId.get(b);
      if (ca && cb) out.push({ points: arc(ca.pos, cb.pos), highlight: false });
    }
    return out;
  }, [cities, byId]);

  return (
    <group>
      {lines.map((l, i) => (
        <Line
          key={i}
          points={l.points}
          color={l.highlight ? GOLD : accent}
          lineWidth={l.highlight ? 2.2 : 1.1}
          transparent
          opacity={l.highlight ? 0.8 : 0.32}
          toneMapped={false}
          dashed={false}
        />
      ))}
    </group>
  );
}
