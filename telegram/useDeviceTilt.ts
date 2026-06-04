"use client";

import { useEffect } from "react";
import { subscribeTilt, isDeviceOrientationAvailable } from "./deviceOrientation";

/**
 * Calls `onTilt(x, y)` (each in [-1, 1], damped + clamped to ±10°) every frame
 * while `active`. Subscribes to the shared sensor only when active, so it
 * stops cleanly when the card goes off-screen or `active` flips to false.
 */
export function useDeviceTilt(active: boolean, onTilt: (x: number, y: number) => void) {
  useEffect(() => {
    if (!active || !isDeviceOrientationAvailable()) return;
    const unsubscribe = subscribeTilt(onTilt);
    return unsubscribe;
    // onTilt is expected to be stable (useCallback) at the call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

export { isDeviceOrientationAvailable };
