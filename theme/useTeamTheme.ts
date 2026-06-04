"use client";

import { useEffect, useMemo } from "react";
import { getTeam, type Team } from "@/data/teams";
import { CHARCOAL, CREAM, onColor } from "./contrast";

export interface ResolvedTheme {
  team: Team | null;
  primary: string;
  secondary: string;
  /** Legible text colour to use on top of `primary` / `secondary`. */
  onPrimary: string;
  onSecondary: string;
  /** Neutral paper + ink — body text always lives on these. */
  bg: string;
  text: string;
}

// Neutral default when no team is selected (matches the cream/charcoal paper).
const NEUTRAL_PRIMARY = "#2B2B2B";
const NEUTRAL_SECONDARY = "#8A8A8A";

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
    bg: CREAM,
    text: CHARCOAL,
  };
}

function applyTheme(el: HTMLElement, t: ResolvedTheme) {
  el.style.setProperty("--color-primary", t.primary);
  el.style.setProperty("--color-secondary", t.secondary);
  el.style.setProperty("--color-on-primary", t.onPrimary);
  el.style.setProperty("--color-on-secondary", t.onSecondary);
  el.style.setProperty("--color-bg", t.bg);
  el.style.setProperty("--color-text", t.text);
}

/**
 * Re-themes the UI to a national team at runtime by swapping CSS variables on
 * `:root`. Team colour drives `--color-primary` / `--color-secondary` (headers
 * + accents); `--color-bg` / `--color-text` stay neutral cream/charcoal so body
 * text is always legible regardless of how bright or dark the team is.
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
