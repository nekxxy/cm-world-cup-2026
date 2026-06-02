"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe2 } from "lucide-react";
import type { Venue } from "@/lib/types";
import { llToVec3 } from "@/lib/geo";
import { detectTier, prefersReducedMotion, type DeviceTier } from "@/lib/deviceTier";
import BrandMark from "@/components/ui/BrandMark";
import PageHeader from "@/components/ui/PageHeader";
import { GlobeCanvas } from "./GlobeCanvas";
import { GlobeLoader } from "./GlobeLoader";
import { GlobeErrorBoundary } from "./GlobeErrorBoundary";
import { Globe2DFallback } from "./Globe2DFallback";
import { VenueHUD, type VenueMeta } from "./VenueHUD";

const pos = (v: Venue): [number, number, number] => llToVec3(v.lat, v.lon, 1);

export default function GlobeExperience({
  venues,
  venueMeta,
  initialFocusId,
}: {
  venues: Venue[];
  venueMeta: Record<string, VenueMeta>;
  initialFocusId: string | null;
}) {
  const opening = useMemo(
    () => venues.find((v) => v.opening) ?? venues[0],
    [venues],
  );
  const initialVenue = useMemo(
    () => (initialFocusId ? venues.find((v) => v.id === initialFocusId) : null),
    [initialFocusId, venues],
  );

  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [reduced, setReduced] = useState(false);
  const [accent, setAccent] = useState("#19e3c6");
  const [selected, setSelected] = useState<Venue | null>(initialVenue ?? null);
  const [hovered, setHovered] = useState<Venue | null>(null);
  const [focusPos, setFocusPos] = useState<[number, number, number] | null>(
    null,
  );

  useEffect(() => {
    setTier(detectTier());
    setReduced(prefersReducedMotion());
    const a = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    if (a) setAccent(a);
    // Initial camera focus: requested venue, else the opening venue.
    const first = initialVenue ?? opening;
    if (first) setFocusPos(pos(first));
  }, [initialVenue, opening]);

  const handleSelect = (v: Venue) => {
    setSelected(v);
    setFocusPos(pos(v));
  };

  const meta = (v: Venue | null): VenueMeta =>
    (v && venueMeta[v.id]) || { count: 0, firstMatchId: null };

  // Pre-mount: brief loader.
  if (tier === null) {
    return (
      <div className="fixed inset-0 z-0 grid place-items-center bg-bg">
        <Globe2 className="size-10 animate-pulse text-accent" />
      </div>
    );
  }

  // No WebGL / very low-end → clean 2D dashboard in normal flow.
  if (tier === "none") {
    return (
      <div className="rise-in">
        <PageHeader
          kicker="16 host cities"
          title="Host cities"
          subtitle="Explore every WC26 venue."
        />
        <Globe2DFallback
          venues={venues}
          activeId={selected?.id ?? null}
          onSelect={setSelected}
        />
        {selected ? (
          <div className="mt-4">
            <VenueHUD
              venue={selected}
              meta={meta(selected)}
              onClose={() => setSelected(null)}
            />
          </div>
        ) : null}
      </div>
    );
  }

  // WebGL globe — full-bleed canvas with glassy overlays.
  return (
    <>
      <div className="fixed inset-0 z-0">
        <GlobeErrorBoundary
          fallback={
            <div className="absolute inset-0 overflow-auto bg-bg px-4 pt-safe [--pt:1.25rem]">
              <Globe2DFallback
                venues={venues}
                activeId={selected?.id ?? null}
                onSelect={setSelected}
              />
            </div>
          }
        >
          <GlobeCanvas
            venues={venues}
            accent={accent}
            tier={tier}
            focusPos={focusPos}
            activeId={selected?.id ?? null}
            allowAutoRotate={!reduced}
            onSelect={handleSelect}
            onHover={setHovered}
          />
          <GlobeLoader />
        </GlobeErrorBoundary>
      </div>

      {/* Top overlay: brand + legend + hover label */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-10 pt-safe [--pt:1rem]">
        <div className="mx-auto flex max-w-[640px] items-center justify-between px-4">
          <BrandMark href={null} className="text-xl" />
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1 text-gold">
              <span className="size-2 rounded-full bg-gold" /> Opening
            </span>
            <span className="flex items-center gap-1 text-[#ff5da2]">
              <span className="size-2 rounded-full bg-[#ff5da2]" /> Final
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <span
            className={`glass rounded-full px-3 py-1 text-xs font-semibold text-text transition-opacity ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {hovered ? `${hovered.city} · ${hovered.stadium}` : "—"}
          </span>
        </div>
      </div>

      {/* Hint */}
      {!selected ? (
        <div className="pointer-events-none fixed inset-x-0 top-1/2 z-10 flex justify-center">
          <span className="glass mt-24 rounded-full px-3 py-1 text-xs text-dim">
            Drag to spin · tap a city
          </span>
        </div>
      ) : null}

      {/* Bottom venue panel, above the nav */}
      {selected ? (
        <div
          className="pointer-events-none fixed inset-x-0 z-20 mx-auto max-w-[640px] px-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 104px)" }}
        >
          <VenueHUD
            venue={selected}
            meta={meta(selected)}
            onClose={() => setSelected(null)}
          />
        </div>
      ) : null}
    </>
  );
}
