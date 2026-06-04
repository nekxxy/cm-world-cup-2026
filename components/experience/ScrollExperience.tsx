"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Team } from "@/data/teams";
import type { TelegramUser } from "@/telegram/types";
import { teamsInGroup, groupFixtures } from "@/data/fixtures";
import { useSmoothScroll } from "@/scenes/scroll/useSmoothScroll";
import TeamCrest from "@/components/TeamCrest";
import PlayerCard, { type Player } from "@/components/PlayerCard";
import HeroBall from "@/scenes/HeroBall";
import Trophy from "@/scenes/Trophy";

// Placeholder squad until real rosters + risograph art are supplied.
const SAMPLE_SQUAD: Player[] = [
  { name: "The Captain", position: "MF", number: 10, rarity: "captain" },
  { name: "The Star", position: "FW", number: 9, rarity: "star" },
  { name: "The Keeper", position: "GK", number: 1, rarity: "regular" },
];

gsap.registerPlugin(ScrollTrigger);

export default function ScrollExperience({
  team,
  user,
  onChangeTeam,
}: {
  team: Team;
  user: TelegramUser | null;
  onChangeTeam: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const update = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useSmoothScroll(reducedMotion);

  useEffect(() => {
    if (reducedMotion || !root.current) return;

    const ctx = gsap.context((self) => {
      const q = self.selector!;

      // --- Pinned hero: title rises & fades, ball eases back as you scroll out
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "+=100%",
            scrub: true,
            pin: true,
            pinSpacing: true,
          },
        })
        .to(".hero-copy", { y: -40, opacity: 0, ease: "none" }, 0)
        .to(".hero-stage", { scale: 0.8, opacity: 0.35, ease: "none" }, 0);

      // --- Scrubbed fade-up for ordinary (non-pinned) content
      q(".reveal-item").forEach((el: Element) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 88%", end: "top 55%", scrub: true },
        });
      });

      // --- Pinned trophy payoff: scales/fades in on the way through
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".trophy-section",
            start: "top top",
            end: "+=100%",
            scrub: true,
            pin: true,
            pinSpacing: true,
          },
        })
        .from(".trophy-stage", { scale: 0.6, opacity: 0, ease: "none" }, 0)
        .from(".trophy-copy", { y: 40, opacity: 0, ease: "none" }, 0.1);
    }, root);

    return () => ctx.revert();
  }, [reducedMotion, team.id]);

  const group = teamsInGroup(team.group);
  const fixtures = groupFixtures(team.group);
  const firstName = user?.first_name ?? "there";

  return (
    <div ref={root}>
      {/* HERO (pinned, 3D peak) */}
      <section className="hero-section" style={S.hero}>
        <div className="hero-copy" style={S.col}>
          <div style={S.eyebrowRow}>
            <TeamCrest team={team} size={26} />
            <span style={S.eyebrow}>GROUP {team.group} · YOUR ROAD TO GLORY</span>
          </div>
          <h1 style={S.heroTitle}>{team.name}</h1>
        </div>
        <div className="hero-stage" style={{ width: "100%", maxWidth: 460 }}>
          <HeroBall primary={team.primary} secondary={team.secondary} />
        </div>
        <span style={S.scrollHint}>scroll ↓</span>
      </section>

      {/* REVEAL */}
      <section style={S.section}>
        <p className="reveal-item" style={S.kicker}>SUMMER 2026</p>
        <h2 className="reveal-item" style={S.bigType}>48 nations.</h2>
        <h2 className="reveal-item" style={{ ...S.bigType, color: "var(--color-accent)" }}>
          One trophy.
        </h2>
        <p className="reveal-item" style={S.lede}>
          The biggest World Cup ever. And you, {firstName}, are flying {team.name}&apos;s flag.
        </p>
      </section>

      {/* HOST CONTEXT */}
      <section style={S.section}>
        <p className="reveal-item" style={S.kicker}>THE STAGE</p>
        <h3 className="reveal-item" style={S.h3}>Hosted across North America</h3>
        <div className="reveal-item" style={S.chipRow}>
          {["United States", "Canada", "Mexico"].map((c) => (
            <span key={c} className="chip-secondary">{c}</span>
          ))}
        </div>
        <div style={S.statGrid}>
          {[
            ["104", "matches"],
            ["16", "host cities"],
            ["Jun 11 – Jul 19", "2026"],
          ].map(([n, l]) => (
            <div key={l} className="reveal-item themed-panel" style={S.stat}>
              <div style={S.statNum}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAMS (your group) */}
      <section style={S.section}>
        <p className="reveal-item" style={S.kicker}>GROUP {team.group}</p>
        <h3 className="reveal-item" style={S.h3}>Your group</h3>
        <div style={S.col2}>
          {group.map((t) => {
            const mine = t.id === team.id;
            return (
              <div
                key={t.id}
                className="reveal-item themed-panel"
                style={{ ...S.teamRow, ...(mine ? S.teamRowMine : null) }}
              >
                <TeamCrest team={t} size={26} />
                <span style={{ flex: 1, fontWeight: 600 }}>{t.name}</span>
                {mine && <span style={S.youTag}>YOU</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* SQUAD (holographic foil cards) */}
      <section style={S.section}>
        <p className="reveal-item" style={S.kicker}>YOUR SQUAD</p>
        <h3 className="reveal-item" style={S.h3}>Collect the foil</h3>
        <p className="reveal-item" style={{ ...S.lede, marginBottom: 18 }}>
          Tilt your phone — star &amp; captain cards catch the light. Regulars stay matte.
        </p>
        <div className="reveal-item" style={S.cardRow}>
          {SAMPLE_SQUAD.map((p) => (
            <PlayerCard key={p.number} player={p} team={team} />
          ))}
        </div>
      </section>

      {/* FIXTURES */}
      <section style={S.section}>
        <p className="reveal-item" style={S.kicker}>GROUP STAGE</p>
        <h3 className="reveal-item" style={S.h3}>Fixtures</h3>
        {[1, 2, 3].map((md) => (
          <div key={md} className="reveal-item" style={{ marginBottom: 14 }}>
            <div style={S.mdLabel}>
              MATCHDAY {md} · {fixtures.find((f) => f.matchday === md)?.date}
            </div>
            {fixtures
              .filter((f) => f.matchday === md)
              .map((f) => (
                <div key={`${f.home.id}-${f.away.id}`} className="themed-panel" style={S.fixture}>
                  <span style={S.fxTeam}>
                    <TeamCrest team={f.home} size={20} /> {f.home.code}
                  </span>
                  <span style={S.vs}>v</span>
                  <span style={{ ...S.fxTeam, justifyContent: "flex-end" }}>
                    {f.away.code} <TeamCrest team={f.away} size={20} />
                  </span>
                </div>
              ))}
          </div>
        ))}
      </section>

      {/* TROPHY PAYOFF (pinned, 3D peak) */}
      <section className="trophy-section" style={S.trophy}>
        <div className="trophy-stage" style={{ display: "grid", placeItems: "center" }}>
          <Trophy primary={team.primary} secondary={team.secondary} />
        </div>
        <div className="trophy-copy" style={S.col}>
          <h2 style={S.bigType}>Lift it.</h2>
          <p style={S.lede}>This is what {team.name} is chasing.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={S.footer}>
        <p style={{ margin: 0, fontWeight: 700 }}>Built for the world.</p>
        <p style={{ margin: "2px 0 16px", color: "var(--color-muted)" }}>
          Themed for <span className="accent-text" style={{ fontWeight: 700 }}>{team.name}</span>.
        </p>
        <button type="button" onClick={onChangeTeam} style={S.changeBtn}>Change team</button>
        <p style={S.fine}>WC26 Fantasy · unofficial · for fun</p>
      </footer>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  hero: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "24px 16px",
    textAlign: "center",
  },
  col: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  eyebrowRow: { display: "flex", alignItems: "center", gap: 8 },
  eyebrow: { fontSize: 12, letterSpacing: 1.5, fontWeight: 700, color: "var(--color-muted)" },
  heroTitle: { margin: 0, fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: -1 },
  scrollHint: { fontSize: 12, color: "var(--color-muted)", letterSpacing: 1 },

  section: { maxWidth: 480, margin: "0 auto", padding: "64px 16px" },
  kicker: { margin: 0, fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "var(--color-accent)" },
  bigType: { margin: "4px 0", fontSize: 44, fontWeight: 900, lineHeight: 1, letterSpacing: -1.5 },
  h3: { margin: "6px 0 16px", fontSize: 26, fontWeight: 800 },
  lede: { margin: "12px 0 0", fontSize: 16, lineHeight: 1.5, color: "var(--color-muted)" },

  cardRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 },
  stat: { textAlign: "center", padding: "14px 8px" },
  statNum: { fontSize: 18, fontWeight: 800, color: "var(--color-accent)" },
  statLabel: { fontSize: 11, color: "var(--color-muted)", marginTop: 2 },

  col2: { display: "flex", flexDirection: "column", gap: 8 },
  teamRow: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" },
  teamRowMine: { border: "2px solid var(--color-accent)" },
  youTag: { fontSize: 11, fontWeight: 800, color: "var(--color-accent)", letterSpacing: 1 },

  mdLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--color-muted)", margin: "0 0 6px 2px" },
  fixture: { display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", marginBottom: 6 },
  fxTeam: { flex: 1, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  vs: { fontSize: 12, color: "var(--color-muted)" },

  trophy: {
    minHeight: "100svh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "24px 16px",
    textAlign: "center",
  },

  footer: { maxWidth: 480, margin: "0 auto", padding: "48px 16px calc(48px + var(--safe-bottom))", textAlign: "center" },
  changeBtn: {
    padding: "11px 20px",
    borderRadius: 999,
    background: "transparent",
    color: "var(--color-accent)",
    border: "1px solid var(--color-accent)",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  fine: { marginTop: 20, fontSize: 11, color: "var(--color-muted)", letterSpacing: 0.5 },
};
