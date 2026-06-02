"use client";

import { useEffect } from "react";
import { hexToRgb } from "@/lib/teamColors";

/**
 * Retints the whole UI (and, on its next mount, the globe) to a colour —
 * used for match-day mode when a favourite team is playing. Renders nothing.
 */
export default function ThemeAccent({ color }: { color: string | null }) {
  useEffect(() => {
    if (!color) return;
    const root = document.documentElement;
    const prevAccent = root.style.getPropertyValue("--accent");
    const prevRgb = root.style.getPropertyValue("--accent-rgb");
    root.style.setProperty("--accent", color);
    root.style.setProperty("--accent-rgb", hexToRgb(color));
    return () => {
      root.style.setProperty("--accent", prevAccent);
      root.style.setProperty("--accent-rgb", prevRgb);
    };
  }, [color]);
  return null;
}
