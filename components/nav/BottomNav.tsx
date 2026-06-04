"use client";

import { hapticSelection } from "@/telegram/haptics";

export type Tab = "home" | "fixtures" | "xi" | "tasks" | "profile";

const ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "fixtures", label: "Fixtures", icon: "📅" },
  { id: "xi", label: "My XI", icon: "⚽" },
  { id: "tasks", label: "Tasks", icon: "⭐" },
  { id: "profile", label: "Profile", icon: "👤" },
];

export const BOTTOM_NAV_HEIGHT = 64;

export default function BottomNav({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav style={styles.nav} aria-label="Primary">
      {ITEMS.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            aria-current={on ? "page" : undefined}
            onClick={() => {
              if (!on) {
                hapticSelection();
                onChange(it.id);
              }
            }}
            style={{ ...styles.item, color: on ? "var(--color-accent)" : "var(--color-muted)" }}
          >
            <span style={{ fontSize: 20, lineHeight: 1, opacity: on ? 1 : 0.7 }} aria-hidden>{it.icon}</span>
            <span style={{ fontSize: 10, fontWeight: on ? 800 : 600 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    height: `calc(${BOTTOM_NAV_HEIGHT}px + var(--safe-bottom))`,
    paddingBottom: "var(--safe-bottom)",
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    background: "color-mix(in srgb, var(--color-bg) 90%, transparent)",
    backdropFilter: "blur(10px)",
    borderTop: "1px solid var(--color-hairline)",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    minHeight: 48,
  },
};
