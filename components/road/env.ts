/** Scene constants + studio "golden" / "spotlight" palettes for the match-ball hero. */

export type Mode = "day" | "night";

export interface Palette {
  bg: string;
  key: string; // key light colour
  keyIntensity: number;
  keyPos: [number, number, number];
  rim: string; // rim/back light colour
  rimIntensity: number;
  ambient: number;
  fog: string;
  fogDensity: number;
  floor: string;
  sparkle: string;
  bloom: number;
}

export const PALETTES: Record<Mode, Palette> = {
  // Golden studio — warm, premium, inviting.
  day: {
    bg: "#11131d",
    key: "#ffe6b8",
    keyIntensity: 3.1,
    keyPos: [5, 6, 4],
    rim: "#7fa0ff",
    rimIntensity: 1.1,
    ambient: 0.5,
    fog: "#11131d",
    fogDensity: 0.018,
    floor: "#0c0f18",
    sparkle: "#ffd98a",
    bloom: 0.6,
  },
  // Spotlight night — dramatic, cinematic, floodlit.
  night: {
    bg: "#05070e",
    key: "#d6e3ff",
    keyIntensity: 2.3,
    keyPos: [4, 7, 3],
    rim: "#9a7bff",
    rimIntensity: 1.7,
    ambient: 0.22,
    fog: "#05070e",
    fogDensity: 0.032,
    floor: "#05070e",
    sparkle: "#ffd98a",
    bloom: 1.15,
  },
};

export const CAMERA = {
  position: [0, 0.6, 6.2] as [number, number, number],
  fov: 38,
  target: [0, 0.1, 0] as [number, number, number],
};

export const GOLD = "#e9b24c";
export const FLOOD = "#fff6e0";
