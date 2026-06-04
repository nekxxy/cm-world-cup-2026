"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Team } from "@/data/teams";
import { useDeviceTilt } from "@/telegram/useDeviceTilt";
import { useNearViewport } from "@/scenes/scroll/useNearViewport";

export type Rarity = "captain" | "star" | "regular";

export interface Player {
  name: string;
  position: string; // e.g. "FW", "GK"
  number: number;
  rarity: Rarity;
  /** Risograph poster art, supplied later. Falls back to a themed placeholder. */
  artUrl?: string;
}

const FOIL: Record<Rarity, number> = { captain: 1, star: 0.8, regular: 0 };

const BADGE: Partial<Record<Rarity, { label: string; bg: string; fg: string }>> = {
  captain: { label: "C", bg: "#E8C66B", fg: "#1a1a1a" },
  star: { label: "★", bg: "#ffffff", fg: "#1a1a1a" },
};

export default function PlayerCard({ player, team }: { player: Player; team: Team }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const near = useNearViewport(cardRef, "20% 0px 20% 0px");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const update = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const foil = FOIL[player.rarity];
  // Only holographic cards react to tilt; regulars stay plain, reduced-motion
  // and off-screen cards get the static sheen (no sensor subscription).
  const active = foil > 0 && near && !reducedMotion;

  const onTilt = useCallback((x: number, y: number) => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `${x * 10}deg`);
    el.style.setProperty("--ry", `${-y * 10}deg`);
    el.style.setProperty("--glare-x", `${50 + x * 50}%`);
    el.style.setProperty("--glare-y", `${50 + y * 50}%`);
    el.style.setProperty("--holo-x", `${x * 120}px`);
    el.style.setProperty("--holo-y", `${y * 120}px`);
  }, []);

  useDeviceTilt(active, onTilt);

  const badge = BADGE[player.rarity];

  return (
    <div className="pc-perspective">
      <div className="pc-card" ref={cardRef} style={{ ["--foil" as string]: foil }}>
        {/* Placeholder risograph-style art until real posters arrive. */}
        <div
          className="pc-art"
          style={{
            background: `radial-gradient(120% 80% at 30% 20%, ${team.primary}, ${team.secondary})`,
          }}
        >
          {player.artUrl ? (
            <img src={player.artUrl} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 64, fontWeight: 900, color: "rgba(255,255,255,0.85)", letterSpacing: -2 }}>
              {player.number}
            </span>
          )}
        </div>

        {foil > 0 && <div className="pc-foil" />}
        {foil > 0 && <div className="pc-glare" />}

        {badge && (
          <div className="pc-badge" style={{ background: badge.bg, color: badge.fg }}>
            {badge.label}
          </div>
        )}

        <div className="pc-info">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, opacity: 0.85 }}>
            {player.position} · {team.code}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.1 }}>{player.name}</div>
        </div>
      </div>
    </div>
  );
}
