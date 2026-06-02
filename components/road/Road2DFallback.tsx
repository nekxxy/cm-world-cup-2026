import type { Mode } from "./env";

/** CSS-only premium match ball for devices without WebGL (never blanks). */
export function Road2DFallback({ mode }: { mode: Mode }) {
  const night = mode === "night";
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: night
            ? "radial-gradient(120% 90% at 50% 30%, #0d1430 0%, #05070e 60%, #04060c 100%)"
            : "radial-gradient(120% 90% at 50% 28%, #2a2742 0%, #15182a 55%, #0a0d18 100%)",
        }}
      />
      {/* Glow behind the ball */}
      <div
        className="absolute left-1/2 top-1/2 size-[420px] max-w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background: night
            ? "radial-gradient(circle, rgba(214,227,255,0.25), transparent 70%)"
            : "radial-gradient(circle, rgba(233,178,76,0.3), transparent 70%)",
        }}
      />
      {/* The ball */}
      <div
        className="beacon-pulse absolute left-1/2 top-1/2 size-[260px] max-w-[62vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 38% 32%, #ffffff 0%, #e7e9ee 38%, #b9bdc9 70%, #6c7180 100%)",
          boxShadow:
            "inset -28px -28px 60px rgba(0,0,0,0.45), 0 30px 80px -20px rgba(0,0,0,0.7)",
        }}
      />
      {/* Floor reflection hint */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(255,255,255,0.04))",
        }}
      />
      <div className="absolute inset-0 grain opacity-[0.05]" />
    </div>
  );
}
