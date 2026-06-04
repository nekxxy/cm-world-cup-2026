"use client";

/* eslint-disable @next/next/no-img-element */
import type { Team } from "@/data/teams";
import type { TelegramUser } from "@/telegram/types";
import TeamCrest from "./TeamCrest";

export default function ThemedHome({
  team,
  user,
  onChangeTeam,
}: {
  team: Team;
  user: TelegramUser | null;
  onChangeTeam: () => void;
}) {
  const firstName = user?.first_name ?? "there";

  return (
    <main style={styles.wrap}>
      <div style={styles.inner}>
        <header className="themed-header" style={styles.header}>
          <div style={styles.headerTop}>
            <TeamCrest team={team} size={34} />
            <span style={styles.group}>GROUP {team.group}</span>
          </div>
          <h1 style={styles.teamName}>{team.name}</h1>
          <p style={styles.greeting}>Welcome aboard, {firstName} 🌍</p>
        </header>

        <section className="themed-panel" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>
            You&apos;re backing <span className="accent-text" style={{ fontWeight: 800 }}>{team.name}</span>
          </h2>
          <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.5, fontSize: 14 }}>
            Your pick is saved to your Telegram account, so it&apos;ll be here next time you
            open the app — on any device. The game lands here soon.
          </p>
        </section>

        <button type="button" onClick={onChangeTeam} style={styles.changeBtn}>
          Change team
        </button>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100dvh" },
  inner: { maxWidth: 480, margin: "0 auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 },
  header: { display: "flex", flexDirection: "column", gap: 6 },
  headerTop: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  group: { fontSize: 12, fontWeight: 700, letterSpacing: 1, opacity: 0.9 },
  teamName: { margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.05 },
  greeting: { margin: 0, fontSize: 14, opacity: 0.9 },
  changeBtn: {
    alignSelf: "center",
    marginTop: 4,
    padding: "11px 18px",
    borderRadius: 999,
    background: "transparent",
    color: "var(--color-accent)",
    border: "1px solid var(--color-accent)",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};
