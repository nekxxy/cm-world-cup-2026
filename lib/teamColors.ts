import type { Team } from "./types";

/**
 * Curated accent colours for match-day theming, keyed by 3-letter code.
 * These are brand/kit colours (design data) — NOT match data — and are only
 * used to retint the UI/globe when a favourite team plays. A team's own
 * seeded `colors.primary` wins if present; otherwise we fall back to the
 * default brand accent.
 */
const DEFAULT_ACCENT = "#19e3c6";

const PALETTE: Record<string, string> = {
  ARG: "#6cb4ee",
  BRA: "#ffdf00",
  FRA: "#3b6fd6",
  ENG: "#e3413b",
  ESP: "#e03a3a",
  GER: "#e7c200",
  POR: "#d12e34",
  NED: "#ff7a18",
  BEL: "#e7b416",
  ITA: "#1f86ff",
  CRO: "#e7413b",
  URU: "#4aa3ff",
  MEX: "#16a34a",
  USA: "#3b6fd6",
  CAN: "#e7413b",
  JPN: "#1b46c2",
  KOR: "#e7413b",
  AUS: "#f4c04e",
  MAR: "#c1272d",
  SEN: "#16a34a",
  GHA: "#e7413b",
  NGA: "#16a34a",
  CMR: "#16a34a",
  SUI: "#e7413b",
  DEN: "#e7413b",
  POL: "#e7547e",
  SRB: "#e7413b",
  ECU: "#f4c04e",
  COL: "#f4c04e",
  KSA: "#16a34a",
  QAT: "#7a1535",
  IRN: "#e7413b",
};

/** Resolve a vivid accent hex for a team's match-day theme. */
export function teamAccent(team: Team | null | undefined): string {
  if (!team) return DEFAULT_ACCENT;
  if (team.colors?.primary) return team.colors.primary;
  if (team.code && PALETTE[team.code.toUpperCase()]) {
    return PALETTE[team.code.toUpperCase()];
  }
  return DEFAULT_ACCENT;
}

/** "#rrggbb" → "r, g, b" for rgba() composition in CSS vars. */
export function hexToRgb(hex: string): string {
  const m = hex.replace("#", "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
