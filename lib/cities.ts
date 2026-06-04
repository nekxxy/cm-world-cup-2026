import { VENUES } from "./venues";
import type { Venue } from "./types";

/**
 * Host cities for "The Road to 2026". Reuses the verified venue data and
 * projects each city's real lat/lon onto a terrain plane (x = E/W, z = N/S),
 * so beacons sit in roughly their true geographic arrangement across
 * USA · Canada · Mexico.
 */
export interface City extends Venue {
  /** Position on the terrain plane: [x (east+), z (south+ / toward camera)]. */
  pos: [number, number];
  /** Subtle nation tint (used sparingly, never as a flag collage). */
  nationColor: string;
  /** Gets a low-poly stadium miniature in the hero scene. */
  marquee: boolean;
}

// Rough continental centre + scale that frames the 16 cities nicely.
const LON0 = -97;
const LAT0 = 38;
const KX = 0.34;
const KZ = 0.36;

const NATION_COLOR: Record<string, string> = {
  US: "#5b7cff",
  CA: "#e5575c",
  MX: "#2fbf71",
};

const MARQUEE = new Set([
  "mexico-city",
  "new-york-nj",
  "los-angeles",
  "dallas",
  "toronto",
  "miami",
  "seattle",
]);

export const CITIES: City[] = VENUES.map((v) => ({
  ...v,
  pos: [(v.lon - LON0) * KX, (v.lat - LAT0) * -KZ] as [number, number],
  nationColor: NATION_COLOR[v.countryCode] ?? "#e9b24c",
  marquee: Boolean(v.opening || v.final) || MARQUEE.has(v.id),
}));

const byId = new Map(CITIES.map((c) => [c.id, c]));
export const getCity = (id: string) => byId.get(id);

export const openingCity = CITIES.find((c) => c.opening)!;
export const finalCity = CITIES.find((c) => c.final)!;

/** Plane half-extents (for sizing the terrain / camera framing). */
export const PLANE = (() => {
  const xs = CITIES.map((c) => c.pos[0]);
  const zs = CITIES.map((c) => c.pos[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
  };
})();
