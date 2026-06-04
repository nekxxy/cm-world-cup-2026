// Android performance class.
//
// Telegram for Android grades every device into a performance class
// (LOW / AVERAGE / HIGH) and we use it to decide whether to run WebGL scenes
// or fall back to a flat hero. The WebApp SDK does not expose this value
// through a stable, documented field across client versions, so we detect it
// best-effort here:
//   1. If a future/ injected field surfaces it, use that.
//   2. Otherwise estimate from the device's reported CPU + memory.
// The result is advisory — never block core UX on it.

export type PerformanceClass = "LOW" | "AVERAGE" | "HIGH" | "UNKNOWN";

export function detectAndroidPerformanceClass(platform: string): PerformanceClass {
  if (typeof window === "undefined") return "UNKNOWN";
  if (platform !== "android" && platform !== "android_x") return "UNKNOWN";

  // 1) Honour an explicit value if a Telegram build ever injects one.
  const injected = (window as unknown as { TelegramWebviewProxyPerformanceClass?: unknown })
    .TelegramWebviewProxyPerformanceClass;
  if (typeof injected === "string") {
    const upper = injected.toUpperCase();
    if (upper === "LOW" || upper === "AVERAGE" || upper === "HIGH") return upper;
  }

  // 2) Estimate from hardware hints (mirrors Telegram's own heuristic shape).
  const cores = navigator.hardwareConcurrency ?? 0;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0;

  if (cores >= 8 && memory >= 6) return "HIGH";
  if (cores >= 4 && memory >= 4) return "AVERAGE";
  if (cores > 0 || memory > 0) return "LOW";
  return "UNKNOWN";
}
