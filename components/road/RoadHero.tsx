"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogIn, MapPinned, Route } from "lucide-react";
import { detectTier, type DeviceTier } from "@/lib/deviceTier";
import { PALETTES, type Mode } from "./env";
import { RoadCanvas } from "./RoadCanvas";
import { RoadLoader } from "./RoadLoader";
import { Road2DFallback } from "./Road2DFallback";
import { MatchNightToggle } from "./MatchNightToggle";
import { GlobeErrorBoundary } from "@/components/Globe/GlobeErrorBoundary";

export default function RoadHero({
  cta,
}: {
  /** Auth entry point for the landing: login (signed out) or onboarding. */
  cta?: "login" | "onboarding" | null;
}) {
  const authCta =
    cta === "login"
      ? { href: "/login", label: "Log in with Telegram" }
      : cta === "onboarding"
        ? { href: "/onboarding", label: "Pick your teams" }
        : null;

  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [mode, setMode] = useState<Mode>("day");

  useEffect(() => {
    setTier(detectTier());
  }, []);

  const palette = PALETTES[mode];
  const settings = useMemo(() => {
    if (tier === "high")
      return { effects: true, maxDpr: 2, reflectiveFloor: true };
    return { effects: false, maxDpr: 1.25, reflectiveFloor: false };
  }, [tier]);

  return (
    <section className="relative ml-[calc(50%-50vw)] -mt-[calc(env(safe-area-inset-top)+5.25rem)] h-[100svh] w-screen overflow-hidden">
      {/* 3D / fallback background */}
      <div className="absolute inset-0">
        {tier === null ? (
          <div className="absolute inset-0 bg-bg" />
        ) : tier === "none" ? (
          <Road2DFallback mode={mode} />
        ) : (
          <GlobeErrorBoundary fallback={<Road2DFallback mode={mode} />}>
            <RoadCanvas
              palette={palette}
              effects={settings.effects}
              reflectiveFloor={settings.reflectiveFloor}
              maxDpr={settings.maxDpr}
            />
            <RoadLoader />
          </GlobeErrorBoundary>
        )}
      </div>

      {/* Legibility scrims + grain */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,10,18,0.5) 0%, transparent 30%, transparent 50%, rgba(7,10,18,0.85) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 grain opacity-[0.04]" />

      {/* Overlay content */}
      <div className="pointer-events-none relative z-20 mx-auto flex h-full max-w-5xl flex-col px-5 pb-7 pt-[calc(env(safe-area-inset-top)+5.5rem)]">
        <div className="flex items-center justify-between gap-2">
          <div className="pointer-events-auto">
            {authCta ? (
              <Link
                href={authCta.href}
                className="glass-2 inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-text transition hover:border-white/20"
              >
                <LogIn className="size-4 text-accent" />
                {authCta.label}
              </Link>
            ) : null}
          </div>
          <div className="pointer-events-auto">
            <MatchNightToggle mode={mode} onChange={setMode} />
          </div>
        </div>

        {/* Headline */}
        <div className="mt-auto max-w-2xl rise-in">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            11 Jun – 19 Jul 2026 · USA · Canada · Mexico
          </p>
          <h1 className="font-display text-[clamp(2.75rem,11vw,6rem)] leading-[0.85] tracking-wide text-text">
            THE ROAD TO <span className="text-grad">2026</span>
          </h1>
          <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-dim">
            Sixteen cities. Three nations. One summer of football.
          </p>

          <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
            <a
              href="#host-cities"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-bg accent-glow transition hover:brightness-110"
            >
              <MapPinned className="size-5" />
              Explore Host Cities
            </a>
            <a
              href="#journey"
              className="glass-2 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-text transition hover:border-white/20"
            >
              <Route className="size-5 text-accent" />
              View Tournament Journey
            </a>
          </div>
        </div>

        {/* Interaction hint */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <span className="glass rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-dim">
            Drag to spin · tap to kick
          </span>
          <a
            href="#host-cities"
            className="pointer-events-auto text-[11px] font-semibold uppercase tracking-[0.2em] text-dim/70 hover:text-text"
          >
            Scroll ↓
          </a>
        </div>
      </div>
    </section>
  );
}
