"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Team } from "@/data/teams";
import { getTeam } from "@/data/teams";
import { nextFixture } from "@/data/schedule";
import { formatIST } from "@/lib/ist";
import { useTelegram } from "@/telegram/useTelegram";
import { useNearViewport } from "./scroll/useNearViewport";
import HeroPoster from "./HeroPoster";
import TeamCrest from "@/components/TeamCrest";

const HeroHubScene = dynamic(() => import("./HeroHubScene"), { ssr: false, loading: () => null });

function Countdown({ target }: { target: string }) {
  const [ms, setMs] = useState(() => new Date(target).getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setMs(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const clamped = Math.max(0, ms);
  const d = Math.floor(clamped / 86400000);
  const h = Math.floor((clamped % 86400000) / 3600000);
  const m = Math.floor((clamped % 3600000) / 60000);

  const Unit = ({ n, l }: { n: number; l: string }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {String(n).padStart(2, "0")}
      </div>
      <div style={{ fontSize: 10, color: "var(--color-muted)", letterSpacing: 1 }}>{l}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start" }}>
      <Unit n={d} l="DAYS" />
      <Unit n={h} l="HRS" />
      <Unit n={m} l="MIN" />
    </div>
  );
}

export default function HeroHub({ team, onOpenBuilder }: { team: Team; onOpenBuilder: () => void }) {
  const { performanceClass } = useTelegram();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const update = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const fixture = useMemo(() => nextFixture(), []);
  const home = getTeam(fixture?.homeId);
  const away = getTeam(fixture?.awayId);

  const flatOnly = performanceClass === "LOW" || reducedMotion;
  const bloom = performanceClass === "HIGH"; // keep mid-range Androids light

  return (
    <div ref={ref} style={styles.hub}>
      {/* Poster paints first; transparent canvas covers it once drawing. */}
      <HeroPoster primary={team.primary} secondary={team.secondary} />

      {mounted && !flatOnly && near && (
        <div style={{ position: "absolute", inset: 0 }}>
          <HeroHubScene primary={team.primary} secondary={team.secondary} bloom={bloom} onEnter={onOpenBuilder} />
        </div>
      )}

      {/* HUD overlay — non-interactive except the CTA, so drags reach the ball. */}
      <div style={styles.overlay}>
        <div style={styles.top}>
          <span style={styles.eyebrow}>NEXT KICKOFF</span>
        </div>

        <div style={styles.bottom}>
          {fixture && (
            <>
              <div style={styles.flags}>
                <Side team={home} fallback={fixture.label?.split(" ")[0]} />
                <span style={styles.vs}>vs</span>
                <Side team={away} fallback="TBD" align="right" />
              </div>
              <Countdown target={fixture.kickoff} />
              <div style={styles.kickoffWhen}>{formatIST(fixture.kickoff)}</div>
            </>
          )}
          <button type="button" onClick={onOpenBuilder} style={styles.cta}>
            Set your World Cup XI
          </button>
          <span style={styles.hint}>tap the ball to kick off ⚽</span>
        </div>
      </div>
    </div>
  );
}

function Side({ team, fallback, align = "left" }: { team?: Team; fallback?: string; align?: "left" | "right" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 64 }}>
      {team ? <TeamCrest team={team} size={34} /> : <div style={styles.tbd} />}
      <span style={{ fontSize: 12, fontWeight: 800, textAlign: align as "left" }}>
        {team?.code ?? fallback ?? "TBD"}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  hub: {
    position: "relative",
    width: "100%",
    height: "min(78svh, 600px)",
    borderRadius: 18,
    overflow: "hidden",
    border: "1px solid var(--color-hairline)",
    background: "var(--color-panel)",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 18,
    pointerEvents: "none",
  },
  top: { display: "flex", justifyContent: "center" },
  eyebrow: { fontSize: 11, letterSpacing: 2, fontWeight: 800, color: "var(--color-muted)" },
  bottom: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  flags: { display: "flex", alignItems: "center", gap: 18 },
  vs: { fontSize: 13, color: "var(--color-muted)", fontWeight: 700 },
  tbd: { width: 34, height: 34, borderRadius: 9, background: "var(--color-hairline)" },
  kickoffWhen: { fontSize: 12, color: "var(--color-muted)" },
  cta: {
    pointerEvents: "auto",
    marginTop: 4,
    padding: "13px 24px",
    borderRadius: 999,
    background: "var(--color-primary)",
    color: "var(--color-on-primary)",
    border: "none",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
  },
  hint: { fontSize: 11, color: "var(--color-muted)", letterSpacing: 0.5 },
};
