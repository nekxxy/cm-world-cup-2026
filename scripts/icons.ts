/**
 * Generate PWA icons + OG image from inline SVG (run once, output committed):
 *   npx tsx scripts/icons.ts
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const ACCENT = "#19e3c6";
const GOLD = "#f4c04e";
const BG = "#05060b";

/** A globe mark: gridded sphere, an accent arc, a gold venue pin. */
function globeSvg(size: number, opts: { pad: number; round: boolean }): string {
  const c = size / 2;
  const r = c - opts.pad;
  const rx = opts.round ? size * 0.22 : 0;
  const grid = `${ACCENT}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg" cx="70%" cy="20%" r="90%">
      <stop offset="0%" stop-color="#0b1830"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
    <radialGradient id="globe" cx="38%" cy="34%" r="75%">
      <stop offset="0%" stop-color="#0d3b3a"/>
      <stop offset="100%" stop-color="#04221f"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#bg)"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="url(#globe)" stroke="${grid}" stroke-width="${size * 0.012}"/>
  <g stroke="${grid}" stroke-opacity="0.5" stroke-width="${size * 0.007}" fill="none">
    <ellipse cx="${c}" cy="${c}" rx="${r * 0.42}" ry="${r}"/>
    <ellipse cx="${c}" cy="${c}" rx="${r * 0.82}" ry="${r}"/>
    <line x1="${c - r}" y1="${c}" x2="${c + r}" y2="${c}"/>
    <path d="M ${c - r * 0.96} ${c - r * 0.34} Q ${c} ${c - r * 0.5} ${c + r * 0.96} ${c - r * 0.34}" />
    <path d="M ${c - r * 0.96} ${c + r * 0.34} Q ${c} ${c + r * 0.5} ${c + r * 0.96} ${c + r * 0.34}" />
  </g>
  <path d="M ${c - r * 0.7} ${c + r * 0.55} Q ${c} ${c - r * 1.2} ${c + r * 0.7} ${c - r * 0.2}"
        fill="none" stroke="${ACCENT}" stroke-width="${size * 0.018}" stroke-linecap="round" opacity="0.9"/>
  <circle cx="${c + r * 0.7}" cy="${c - r * 0.2}" r="${size * 0.05}" fill="${GOLD}"/>
  <circle cx="${c - r * 0.7}" cy="${c + r * 0.55}" r="${size * 0.04}" fill="${ACCENT}"/>
</svg>`;
}

function ogSvg(): string {
  const w = 1200;
  const h = 630;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="bg" cx="78%" cy="12%" r="90%">
      <stop offset="0%" stop-color="#0b1830"/>
      <stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g transform="translate(840,150)">${globeSvg(360, { pad: 18, round: false }).replace(/<svg[^>]*>|<\/svg>/g, "")}</g>
  <text x="80" y="250" font-family="Arial Black, Arial, sans-serif" font-size="120" font-weight="900" fill="#eef1f7" letter-spacing="2">WC<tspan fill="${ACCENT}">26</tspan></text>
  <text x="84" y="320" font-family="Arial, sans-serif" font-size="38" fill="#eef1f7" font-weight="700">FIFA World Cup 2026 companion</text>
  <text x="84" y="380" font-family="Arial, sans-serif" font-size="30" fill="#98a2b3">Interactive globe · Fixtures in IST · Telegram reminders</text>
  <rect x="84" y="430" width="320" height="8" rx="4" fill="${ACCENT}"/>
</svg>`;
}

async function main() {
  const pub = resolve(process.cwd(), "public");
  const icons = resolve(pub, "icons");
  mkdirSync(icons, { recursive: true });

  const png = (svg: string) => sharp(Buffer.from(svg)).png();

  await png(globeSvg(512, { pad: 40, round: true })).toFile(
    resolve(icons, "icon-512.png"),
  );
  await png(globeSvg(192, { pad: 16, round: true })).toFile(
    resolve(icons, "icon-192.png"),
  );
  // Maskable: full-bleed bg, generous safe-zone padding.
  await png(globeSvg(512, { pad: 96, round: false })).toFile(
    resolve(icons, "maskable-512.png"),
  );
  await png(globeSvg(180, { pad: 14, round: true })).toFile(
    resolve(icons, "apple-touch-icon.png"),
  );
  await png(ogSvg()).toFile(resolve(pub, "og.png"));

  console.log("✓ Generated icons + og.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
