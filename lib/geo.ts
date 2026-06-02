export type Vec3 = [number, number, number];

/**
 * Map geographic lat/lon to a point on a sphere of radius r.
 * Matches the spec's Appendix A convention exactly (so pins line up with the
 * equirectangular Earth texture).
 */
export function llToVec3(lat: number, lon: number, r: number): Vec3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const th = ((lon + 180) * Math.PI) / 180;
  return [
    -(r * Math.sin(phi) * Math.cos(th)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(th),
  ];
}

const norm = (v: Vec3): Vec3 => {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
};

/**
 * Points along a great-circle arc between two lat/lon coordinates, lifted off
 * the surface into a smooth bow — used for the glowing venue-to-venue arcs.
 * `lift` is the peak height as a fraction of r above the surface.
 */
export function arcPoints(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
  r: number,
  segments = 48,
  lift = 0.35,
): Vec3[] {
  const pa = norm(llToVec3(a.lat, a.lon, 1));
  const pb = norm(llToVec3(b.lat, b.lon, 1));
  const dot = Math.min(1, Math.max(-1, pa[0] * pb[0] + pa[1] * pb[1] + pa[2] * pb[2]));
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega) || 1e-6;

  const pts: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Spherical linear interpolation between the two surface points.
    const s0 = Math.sin((1 - t) * omega) / sinOmega;
    const s1 = Math.sin(t * omega) / sinOmega;
    const dir = norm([
      pa[0] * s0 + pb[0] * s1,
      pa[1] * s0 + pb[1] * s1,
      pa[2] * s0 + pb[2] * s1,
    ]);
    // Bow upward most at the midpoint (sin curve), scaled by arc length.
    const h = r * (1 + lift * Math.sin(Math.PI * t) * (omega / Math.PI));
    pts.push([dir[0] * h, dir[1] * h, dir[2] * h]);
  }
  return pts;
}
