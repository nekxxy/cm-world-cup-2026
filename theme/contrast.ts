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

function toHex(n: number) {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
}

/** Blend `hex` toward `target` (#fff or #000) by `amount` (0–1). */
function mix(hex: string, target: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const [tr, tg, tb] = parseHex(target);
  return `#${toHex(r + (tr - r) * amount)}${toHex(g + (tg - g) * amount)}${toHex(b + (tb - b) * amount)}`;
}

/**
 * Return a tone of `fg` that meets `ratio` against `bg`, lightening toward
 * white on dark backgrounds (or darkening toward black on light ones). Used to
 * keep a team's brand colour legible as accent TEXT on the dark UI — e.g. a
 * near-black team colour gets lifted so it doesn't vanish on a charcoal page.
 */
export function ensureContrast(fg: string, bg: string, ratio = 4.5): string {
  if (contrastRatio(fg, bg) >= ratio) return fg;
  const target = luminance(bg) < 0.5 ? "#FFFFFF" : "#000000";
  for (let amount = 0.1; amount <= 1; amount += 0.1) {
    const candidate = mix(fg, target, amount);
    if (contrastRatio(candidate, bg) >= ratio) return candidate;
  }
  return target;
}
