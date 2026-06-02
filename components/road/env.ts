/** Scene constants + day / match-night palettes for the Road to 2026 hero. */

export type Mode = "day" | "night";

export interface Palette {
  sky: string;
  key: string; // sun / moon colour
  keyIntensity: number;
  keyPos: [number, number, number];
  ambient: number;
  hemi: number;
  fog: string;
  fogDensity: number;
  grass: string;
  grassDark: string;
  bloom: number;
  beam: number; // floodlight beam opacity
}

export const PALETTES: Record<Mode, Palette> = {
  // Golden hour — warm, soft, arriving in the afternoon.
  day: {
    sky: "#243049",
    key: "#ffd6a0",
    keyIntensity: 2.6,
    keyPos: [9, 7, 6],
    ambient: 0.55,
    hemi: 0.7,
    fog: "#1a2538",
    fogDensity: 0.03,
    grass: "#37a866",
    grassDark: "#236c46",
    bloom: 0.7,
    beam: 0.04,
  },
  // Match night — deep navy, floodlights dominate, beams cut the haze.
  night: {
    sky: "#070b14",
    key: "#c3d4ff",
    keyIntensity: 0.9,
    keyPos: [6, 10, -3],
    ambient: 0.2,
    hemi: 0.28,
    fog: "#070b14",
    fogDensity: 0.055,
    grass: "#1c4d36",
    grassDark: "#0f3024",
    bloom: 1.15,
    beam: 0.16,
  },
};

export const CAMERA = {
  position: [0, 6.4, 16.5] as [number, number, number],
  fov: 40,
  target: [0, 0.6, -1.5] as [number, number, number],
};

export const GROUND = { width: 66, depth: 46 };

export const GOLD = "#e9b24c";
export const FLOOD = "#fff6e0";
