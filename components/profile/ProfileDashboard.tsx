"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import type { Team } from "@/data/teams";
import type { TelegramUser } from "@/telegram/types";
import TeamCrest from "@/components/TeamCrest";

// The user dashboard: real Telegram identity up top, then favourite team and
// honest current state (no fabricated points/ranks — those activate once
// scoring is live).
export default function ProfileDashboard({
  team,
  user,
  onChangeTeam,
  onOpenBuilder,
}: {
  team: Team;
  user: TelegramUser | null;
  onChangeTeam: () => void;
  onOpenBuilder: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const name = user?.first_name ?? "Manager";
  const initials = name[0]?.toUpperCase() ?? "?";

  return (
    <div style={styles.wrap}>
      {/* Identity */}
      <section style={styles.identity}>
        {user?.photo_url && imgOk ? (
          <img src={user.photo_url} alt={name} width={64} height={64} style={styles.avatar} onError={() => setImgOk(false)} />
        ) : (
          <div style={{ ...styles.avatar, ...styles.avatarFallback }}>{initials}</div>
        )}
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{name}</div>
          {user?.username && <div style={{ color: "var(--color-muted)", fontSize: 13 }}>@{user.username}</div>}
        </div>
      </section>

      {/* Favourite team */}
      <section className="themed-panel" style={styles.teamRow}>
        <TeamCrest team={team} size={28} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 700, letterSpacing: 1 }}>FAVOURITE TEAM</div>
          <div style={{ fontWeight: 700 }}>{team.name} · Group {team.group}</div>
        </div>
        <button onClick={onChangeTeam} style={styles.smallBtn}>Change</button>
      </section>

      {/* Honest current-state stats */}
      <section style={styles.statGrid}>
        <Stat label="Total points" value="—" note="after kickoff" />
        <Stat label="Global rank" value="—" note="after kickoff" />
        <Stat label="Status" value="Free" note="unlock Pro" />
        <Stat label="Invites" value="0" note="invite friends" />
        <Stat label="Reminders" value="3 left" note="free limit" />
        <Stat label="XP" value="0" note="do tasks" />
      </section>

      {/* XI preview / CTA */}
      <section className="themed-panel" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "var(--color-muted)", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          YOUR TOURNAMENT XI
        </div>
        <p style={{ margin: "0 0 12px", color: "var(--color-muted)", fontSize: 14 }}>
          One Playing XI for the whole World Cup. Build it once, compete all season.
        </p>
        <button onClick={onOpenBuilder} style={styles.cta}>Open My XI</button>
      </section>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="themed-panel" style={{ padding: "12px 10px" }}>
      <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-accent)" }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 10, color: "var(--color-muted)" }}>{note}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 480, margin: "0 auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 },
  identity: { display: "flex", alignItems: "center", gap: 14, padding: "8px 2px" },
  avatar: { width: 64, height: 64, borderRadius: "50%", objectFit: "cover" },
  avatarFallback: { display: "grid", placeItems: "center", background: "var(--color-primary)", color: "var(--color-on-primary)", fontSize: 26, fontWeight: 800 },
  teamRow: { display: "flex", alignItems: "center", gap: 12 },
  smallBtn: { padding: "7px 14px", borderRadius: 999, background: "transparent", color: "var(--color-accent)", border: "1px solid var(--color-accent)", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" },
  cta: { padding: "12px 24px", borderRadius: 999, background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer" },
};
