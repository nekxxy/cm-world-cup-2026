"use client";

import { useMemo, useState } from "react";
import { TEAMS, type GroupId } from "@/data/teams";
import { useTeamTheme } from "@/theme/useTeamTheme";
import { contrastRatio } from "@/theme/contrast";

const GROUPS: GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// AA = 4.5 for normal text, 3.0 for large text / UI. We hold headers and chips
// (large/bold) to >= 3.0 and body (cream/charcoal) to >= 4.5.
function grade(ratio: number, threshold: number) {
  return ratio >= threshold ? "PASS" : "FAIL";
}

export default function PalettePreview() {
  const [teamId, setTeamId] = useState<string>("colombia"); // start on a bright extreme
  const theme = useTeamTheme(teamId);

  const ratios = useMemo(() => {
    return {
      header: contrastRatio(theme.primary, theme.onPrimary),
      chip: contrastRatio(theme.secondary, theme.onSecondary),
      body: contrastRatio(theme.bg, theme.text),
      // The risky case the brief calls out: would body text survive if it sat
      // directly on the team colour? (It never does — this proves why.)
      naiveTextOnPrimary: contrastRatio(theme.primary, theme.text),
    };
  }, [theme]);

  return (
    <main style={{ background: "var(--color-bg)", color: "var(--color-text)", minHeight: "100dvh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Live sample: header (team colour) + body (neutral panel) */}
        <header className="themed-header">
          <div style={{ fontSize: 13, opacity: 0.85, letterSpacing: 1 }}>GROUP {theme.team?.group}</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800 }}>{theme.team?.name}</h1>
        </header>

        <section className="themed-panel" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            Body copy always sits on this neutral cream panel with charcoal ink, so it stays
            readable whether the team is <span className="accent-text" style={{ fontWeight: 700 }}>navy</span> or
            blinding yellow. Team colour shows up in the header above, the accent word, and the chip below.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="chip-secondary">{theme.team?.code}</span>
            <span style={{ color: "var(--color-muted)", fontSize: 13 }}>secondary accent chip</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div className="accent-bar" style={{ height: 6, flex: 1, borderRadius: 3 }} />
            <div style={{ height: 6, flex: 1, borderRadius: 3, background: "var(--color-secondary)" }} />
          </div>
        </section>

        {/* Contrast audit */}
        <section className="themed-panel">
          <h2 style={{ margin: "0 0 8px", fontSize: 15 }}>Contrast audit (WCAG)</h2>
          <ContrastRow label="Header text on primary" ratio={ratios.header} threshold={3} />
          <ContrastRow label="Chip text on secondary" ratio={ratios.chip} threshold={3} />
          <ContrastRow label="Body ink on cream paper" ratio={ratios.body} threshold={4.5} />
          <ContrastRow
            label="⚠ Body charcoal directly on primary (avoided by design)"
            ratio={ratios.naiveTextOnPrimary}
            threshold={4.5}
          />
        </section>

        {/* Team picker, grouped */}
        <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {GROUPS.map((g) => (
            <div key={g}>
              <div style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 700, marginBottom: 6 }}>
                GROUP {g}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {TEAMS.filter((t) => t.group === g).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTeamId(t.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 10,
                      cursor: "pointer",
                      textAlign: "left",
                      background: "var(--color-panel)",
                      color: "var(--color-text)",
                      border:
                        t.id === teamId
                          ? "2px solid var(--color-text)"
                          : "1px solid var(--color-hairline)",
                    }}
                  >
                    <span style={{ display: "flex", borderRadius: 5, overflow: "hidden", flexShrink: 0 }}>
                      <span style={{ width: 14, height: 22, background: t.primary }} />
                      <span style={{ width: 14, height: 22, background: t.secondary }} />
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function ContrastRow({ label, ratio, threshold }: { label: string; ratio: number; threshold: number }) {
  const pass = grade(ratio, threshold) === "PASS";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderTop: "1px solid var(--color-hairline)" }}>
      <span style={{ fontSize: 13, color: "var(--color-muted)", paddingRight: 10 }}>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 13, color: pass ? "#1a7f37" : "#cf222e", whiteSpace: "nowrap" }}>
        {ratio.toFixed(2)}:1 {pass ? "✓" : "✗"}
      </span>
    </div>
  );
}
