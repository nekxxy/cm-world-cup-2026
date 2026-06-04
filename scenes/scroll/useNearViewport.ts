"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * True while `ref` is within `margin` of the viewport. Used to mount a WebGL
 * canvas only as it approaches and to TEAR IT DOWN once it's well off-screen,
 * so we never keep multiple live GL contexts around.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = "50% 0px 50% 0px"): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);

  return near;
}
