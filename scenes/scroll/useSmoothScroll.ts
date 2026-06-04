"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Wires Lenis smooth-scroll to GSAP's ScrollTrigger so scrubbed animations stay
 * in sync. Honours prefers-reduced-motion: when set, we skip Lenis entirely and
 * let ScrollTrigger drive off native scroll (animations are made instant
 * elsewhere). Touch scrolling stays native — only the wheel is smoothed — which
 * feels best on mobile.
 *
 * Returns nothing; mount it once near the root of the scroll experience.
 */
export function useSmoothScroll(reducedMotion: boolean) {
  useEffect(() => {
    if (reducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      smoothWheel: true,
      // leave touch native for mobile momentum
      duration: 1.1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Recalculate trigger positions once everything has laid out.
    const refresh = () => ScrollTrigger.refresh();
    refresh();

    return () => {
      gsap.ticker.remove(onTick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, [reducedMotion]);
}
