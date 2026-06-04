"use client";

import { useMemo, useState } from "react";
import { TEAMS } from "@/data/teams";
import { hapticSelection } from "@/telegram/haptics";
import TeamCrest from "./TeamCrest";

export default function TeamSelector({
  currentTeamId,
  onSelect,
}: {
  currentTeamId?: string | null;
  onSelect: (teamId: string) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? TEAMS.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
      : TEAMS;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  return (
    <main style={styles.wrap}>
      <div style={styles.inner}>
        <header style={{ marginBottom: 4 }}>
          <h1 style={styles.title}>Who&apos;s your team?</h1>
          <p style={styles.subtitle}>Pick a nation to follow. The whole app dresses up in their colours.</p>
        </header>

        <input
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Search 48 teams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.search}
          aria-label="Search teams"
        />

        <ul style={styles.list}>
          {results.map((t) => {
            const selected = t.id === currentTeamId;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    hapticSelection();
                    onSelect(t.id);
                  }}
                  style={{ ...styles.row, ...(selected ? styles.rowSelected : null) }}
                >
                  <TeamCrest team={t} size={30} />
                  <span style={styles.name}>{t.name}</span>
                  <span style={styles.group}>GRP {t.group}</span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && <li style={styles.empty}>No teams match “{query}”.</li>}
        </ul>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100dvh" },
  inner: {
    maxWidth: 480,
    margin: "0 auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: { margin: 0, fontSize: 26, fontWeight: 800 },
  subtitle: { margin: "6px 0 0", color: "var(--color-muted)", fontSize: 14, lineHeight: 1.4 },
  search: {
    position: "sticky",
    top: "calc(var(--safe-top) + 8px)",
    zIndex: 1,
    width: "100%",
    padding: "13px 14px",
    fontSize: 16, // >=16px avoids iOS zoom-on-focus
    borderRadius: 12,
    background: "var(--color-panel)",
    color: "var(--color-text)",
    border: "1px solid var(--color-hairline)",
    outline: "none",
  },
  list: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    minHeight: 56, // thumb-friendly
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "left",
    background: "var(--color-panel)",
    color: "var(--color-text)",
    border: "1px solid var(--color-hairline)",
  },
  rowSelected: { border: "2px solid var(--color-accent)" },
  name: { flex: 1, fontSize: 16, fontWeight: 600 },
  group: { fontSize: 12, fontWeight: 700, color: "var(--color-muted)", letterSpacing: 0.5 },
  empty: { color: "var(--color-muted)", padding: "16px 4px", fontSize: 14 },
};
