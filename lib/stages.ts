import type { Stage } from "./types";

export const STAGE_LABELS: Record<Stage, string> = {
  group: "Group Stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  "3rd": "Third Place",
  final: "Final",
};

export const STAGE_SHORT: Record<Stage, string> = {
  group: "Groups",
  r32: "R32",
  r16: "R16",
  qf: "QF",
  sf: "SF",
  "3rd": "3rd",
  final: "Final",
};

export const STAGE_ORDER: Stage[] = [
  "group",
  "r32",
  "r16",
  "qf",
  "sf",
  "3rd",
  "final",
];
