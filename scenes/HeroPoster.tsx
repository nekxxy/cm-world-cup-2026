// Flat, WebGL-free hero. Serves two jobs:
//  1. the poster shown before the 3D scene hydrates, and
//  2. the permanent fallback on low-end Androids / reduced-motion.
// Pure SVG + CSS so it costs essentially nothing.

export default function HeroPoster({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        // soft team glow behind the ball
        background: `radial-gradient(60% 60% at 50% 45%, ${primary}33, transparent 70%)`,
      }}
    >
      <svg width="180" height="180" viewBox="0 0 200 200" role="img" aria-label="Football">
        <defs>
          <radialGradient id="ball" cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="45%" stopColor={primary} />
            <stop offset="100%" stopColor={secondary} />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="74" fill="url(#ball)" />
        {/* a few facet hints so it reads as the low-poly ball */}
        <g stroke="rgba(0,0,0,0.18)" strokeWidth="1.2" fill="none">
          <polygon points="100,52 128,74 117,108 83,108 72,74" />
          <line x1="100" y1="52" x2="100" y2="30" />
          <line x1="128" y1="74" x2="150" y2="66" />
          <line x1="117" y1="108" x2="132" y2="134" />
          <line x1="83" y1="108" x2="68" y2="134" />
          <line x1="72" y1="74" x2="50" y2="66" />
        </g>
      </svg>
    </div>
  );
}
