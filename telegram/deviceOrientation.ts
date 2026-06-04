// Shared device-tilt source backed by the Telegram DeviceOrientation sensor
// (Bot API 8.0+). A single ref-counted subscription drives one rAF damping
// loop and broadcasts normalised, CLAMPED values to all listeners — so a page
// full of foil cards never spins up multiple sensor sessions.
//
// Output is { x, y } in [-1, 1], each mapped from a ±MAX_DEG window:
//   x  ← gamma (left/right tilt),  y ← beta (front/back tilt).
// Raw sensor input is never used directly — it's damped toward the target and
// clamped, per the "damp all sensor input" rule.

const MAX_DEG = 10; // clamp window: ±10°
const DAMP = 0.12; // per-frame lerp toward target (lower = smoother/laggier)
const RAD2DEG = 180 / Math.PI;

type Listener = (x: number, y: number) => void;

function getSensor() {
  const wa = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  if (wa?.DeviceOrientation && wa.isVersionAtLeast("8.0")) return { wa, sensor: wa.DeviceOrientation };
  return null;
}

export function isDeviceOrientationAvailable(): boolean {
  return getSensor() !== null;
}

const listeners = new Set<Listener>();
let started = false;
let raf = 0;
const target = { x: 0, y: 0 };
const cur = { x: 0, y: 0 };
let onChange: (() => void) | null = null;

function clampNorm(deg: number) {
  return Math.max(-1, Math.min(1, deg / MAX_DEG));
}

function loop() {
  cur.x += (target.x - cur.x) * DAMP;
  cur.y += (target.y - cur.y) * DAMP;
  for (const fn of listeners) fn(cur.x, cur.y);
  raf = requestAnimationFrame(loop);
}

function start() {
  const found = getSensor();
  if (!found || started) return;
  const { wa, sensor } = found;
  started = true;

  onChange = () => {
    // Telegram reports radians; convert, clamp window, normalise.
    target.x = clampNorm(sensor.gamma * RAD2DEG);
    target.y = clampNorm(sensor.beta * RAD2DEG);
  };
  wa.onEvent("deviceOrientationChanged", onChange);
  sensor.start({ refresh_rate: 60 }, () => {});
  raf = requestAnimationFrame(loop);
}

function stop() {
  const found = getSensor();
  started = false;
  cancelAnimationFrame(raf);
  if (found && onChange) {
    found.wa.offEvent("deviceOrientationChanged", onChange);
    found.sensor.stop(() => {});
  }
  onChange = null;
  target.x = target.y = cur.x = cur.y = 0;
}

/** Subscribe to damped tilt. Returns an unsubscribe fn. Sensor runs only while
 *  at least one subscriber is active. */
export function subscribeTilt(fn: Listener): () => void {
  listeners.add(fn);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) stop();
  };
}
