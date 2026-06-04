// Haptic feedback (Bot API 6.1+), feature-detected and no-op when unavailable.

import type { HapticImpactStyle, HapticNotificationType } from "./types";

function getHaptics() {
  const wa = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  if (wa?.HapticFeedback && wa.isVersionAtLeast("6.1")) return wa.HapticFeedback;
  return null;
}

export function hapticImpact(style: HapticImpactStyle = "medium") {
  try {
    getHaptics()?.impactOccurred(style);
  } catch {
    /* never let haptics break a tap */
  }
}

export function hapticSelection() {
  try {
    getHaptics()?.selectionChanged();
  } catch {
    /* no-op */
  }
}

export function hapticNotify(type: HapticNotificationType) {
  try {
    getHaptics()?.notificationOccurred(type);
  } catch {
    /* no-op */
  }
}
