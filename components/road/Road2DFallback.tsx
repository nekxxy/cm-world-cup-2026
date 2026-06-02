import type { Mode } from "./env";

/** CSS-only cinematic backdrop for devices without WebGL (never blanks). */
export function Road2DFallback({ mode }: { mode: Mode }) {
  const night = mode === "night";
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Dusk / night sky */}
      <div
        className="absolute inset-0"
        style={{
          background: night
            ? "radial-gradient(120% 80% at 50% 0%, #0d1834 0%, #070b14 55%, #04060d 100%)"
            : "radial-gradient(120% 80% at 50% 0%, #3a3253 0%, #1a1f38 45%, #0a0d18 100%)",
        }}
      />
      {/* Horizon glow */}
      <div
        className="absolute inset-x-0 top-[34%] h-40 blur-2xl"
        style={{
          background: night
            ? "radial-gradient(60% 100% at 50% 50%, rgba(195,212,255,0.22), transparent 70%)"
            : "radial-gradient(60% 100% at 50% 50%, rgba(233,178,76,0.3), transparent 70%)",
        }}
      />
      {/* Perspective pitch floor */}
      <div className="absolute inset-x-0 bottom-0 h-[56%] [perspective:520px]">
        <div
          className="absolute inset-0 origin-bottom"
          style={{
            transform: "rotateX(62deg)",
            background:
              "linear-gradient(180deg, rgba(47,191,113,0.05), rgba(47,191,113,0.22))",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 56px), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 56px)",
          }}
        />
      </div>
      <div className="absolute inset-0 grain opacity-[0.05]" />
    </div>
  );
}
