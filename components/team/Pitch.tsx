"use client";

import type { Player, Position } from "@/data/players";

const ROWS: Position[] = ["FWD", "MID", "DEF", "GK"]; // top → bottom

/** Read-only "My Team" pitch: the XI laid out by formation with C/VC badges. */
export default function Pitch({
  players,
  captain,
  viceCaptain,
}: {
  players: Player[];
  captain: string;
  viceCaptain: string;
}) {
  const def = players.filter((p) => p.position === "DEF").length;
  const mid = players.filter((p) => p.position === "MID").length;
  const fwd = players.filter((p) => p.position === "FWD").length;
  const formation = `${def}-${mid}-${fwd}`;

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--color-muted)", marginBottom: 6, fontWeight: 700 }}>
        FORMATION {def + mid + fwd === 10 ? formation : "—"}
      </div>
      <div style={styles.pitch}>
        {ROWS.map((pos) => {
          const row = players.filter((p) => p.position === pos);
          if (row.length === 0) return null;
          return (
            <div key={pos} style={styles.row}>
              {row.map((p) => (
                <div key={p.id} style={styles.token}>
                  <div style={styles.shirt}>
                    {p.id === captain && <span style={{ ...styles.badge, background: "#E8C66B", color: "#1a1a1a" }}>C</span>}
                    {p.id === viceCaptain && <span style={{ ...styles.badge, background: "#fff", color: "#1a1a1a" }}>V</span>}
                    <span style={styles.shirtNum}>{p.position}</span>
                  </div>
                  <span style={styles.tokenName}>{p.name}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pitch: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 10,
    padding: "16px 8px",
    minHeight: 320,
    borderRadius: 14,
    border: "1px solid var(--color-hairline)",
    background:
      "repeating-linear-gradient(0deg, color-mix(in srgb, var(--color-primary) 16%, var(--color-bg)) 0 36px, color-mix(in srgb, var(--color-primary) 9%, var(--color-bg)) 36px 72px)",
  },
  row: { display: "flex", justifyContent: "space-around", gap: 6 },
  token: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 64 },
  shirt: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "var(--color-primary)",
    color: "var(--color-on-primary)",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  shirtNum: { fontSize: 11, fontWeight: 800 },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
    display: "grid",
    placeItems: "center",
  },
  tokenName: { fontSize: 10, color: "var(--color-text)", textAlign: "center", lineHeight: 1.1, whiteSpace: "nowrap" },
};
