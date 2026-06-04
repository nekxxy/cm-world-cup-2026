// WCAG contrast helpers used by the theming layer to guarantee legible text
// on top of any of the 48 team colours.

/** Neutral ink/paper used everywhere body text lives. */
export const CHARCOAL = "#1A1A1A";
export const CREAM = "#FFF8EC";

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Relative luminance per WCAG 2.1. */
export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio (1–21) between two hex colours. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Pick the legible foreground (charcoal or cream) to place ON a given
 * background colour — whichever yields the higher contrast ratio.
 */
export function onColor(bg: string): string {
  return contrastRatio(bg, CHARCOAL) >= contrastRatio(bg, CREAM) ? CHARCOAL : CREAM;
}
