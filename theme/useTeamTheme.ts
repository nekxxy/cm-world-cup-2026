"use client";

import { useEffect, useMemo } from "react";
import { getTeam, type Team } from "@/data/teams";
import { ensureContrast, onColor } from "./contrast";

// Dark, modern neutral paper + ink. Body text always lives on these (or the
// slightly raised panel), never directly on a team colour.
export const DARK_BG = "#0E0F13";
export const DARK_TEXT = "#F2F3F5";

export interface ResolvedTheme {
  team: Team | null;
  primary: string;
  secondary: string;
  /** Legible text colour to use on a filled `primary` / `secondary` surface. */
  onPrimary: string;
  onSecondary: string;
  /** Brand colour adjusted to be legible as ACCENT TEXT on the dark page. */
  accent: string;
  /** Neutral dark paper + light ink. */
  bg: string;
  text: string;
}

// Neutral default when no team is selected.
const NEUTRAL_PRIMARY = "#3A3D46";
const NEUTRAL_SECONDARY = "#6B7280";

export function resolveTheme(teamId: string | null | undefined): ResolvedTheme {
  const team = getTeam(teamId) ?? null;
  const primary = team?.primary ?? NEUTRAL_PRIMARY;
  const secondary = team?.secondary ?? NEUTRAL_SECONDARY;
  return {
    team,
    primary,
    secondary,
    onPrimary: onColor(primary),
    onSecondary: onColor(secondary),
    // Prefer whichever brand colour reads better on dark, then guarantee AA.
    accent: ensureContrast(primary, DARK_BG, 4.5),
    bg: DARK_BG,
    text: DARK_TEXT,
  };
}

function applyTheme(el: HTMLElement, t: ResolvedTheme) {
  el.style.setProperty("--color-primary", t.primary);
  el.style.setProperty("--color-secondary", t.secondary);
  el.style.setProperty("--color-on-primary", t.onPrimary);
  el.style.setProperty("--color-on-secondary", t.onSecondary);
  el.style.setProperty("--color-accent", t.accent);
  el.style.setProperty("--color-bg", t.bg);
  el.style.setProperty("--color-text", t.text);
}

/**
 * Re-themes the UI to a national team at runtime by swapping CSS variables on
 * `:root`. Team colour drives `--color-primary` / `--color-secondary` (filled
 * headers + accents) and `--color-accent` (legible accent text on dark);
 * `--color-bg` / `--color-text` stay a neutral dark palette so body text is
 * always legible regardless of how bright or dark the team is.
 *
 * Pass `null` to reset to the neutral palette.
 */
export function useTeamTheme(teamId: string | null | undefined): ResolvedTheme {
  const theme = useMemo(() => resolveTheme(teamId), [teamId]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    applyTheme(document.documentElement, theme);
  }, [theme]);

  return theme;
}
