"use client";

/**
 * Device capability gating for the 3D globe.
 *  - "none": no WebGL or a very low-end device → render the 2D fallback.
 *  - "low" : capable but modest → globe with reduced quality (no bloom, dpr 1).
 *  - "high": full realism (bloom, clouds, higher dpr).
 */
export type DeviceTier = "high" | "low" | "none";

interface NavigatorExtras {
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectTier(): DeviceTier {
  if (!hasWebGL()) return "none";
  const nav = navigator as Navigator & NavigatorExtras;
  const mem = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;

  // Extremely constrained → safer on the 2D dashboard.
  if (mem <= 1) return "none";
  if (mem <= 3 || cores <= 4) return "low";
  return "high";
}
