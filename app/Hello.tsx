"use client";

/* eslint-disable @next/next/no-img-element */
import { useTelegram } from "@/telegram/useTelegram";

export default function Hello() {
  const { ready, isTelegram, user, platform, version, performanceClass } = useTelegram();

  if (!ready) {
    return (
      <main style={styles.center}>
        <p style={{ color: "var(--tg-hint)" }}>Connecting to Telegram…</p>
      </main>
    );
  }

  if (!isTelegram || !user) {
    return (
      <main style={styles.center}>
        <h1 style={styles.heading}>Open me inside Telegram</h1>
        <p style={{ color: "var(--tg-hint)", maxWidth: 320, textAlign: "center" }}>
          This is a Telegram Mini App. Launch it from the bot to see your profile
          and start playing.
        </p>
      </main>
    );
  }

  const initials = user.first_name?.[0]?.toUpperCase() ?? "?";

  return (
    <main style={styles.center}>
      {user.photo_url ? (
        <img src={user.photo_url} alt={user.first_name} width={96} height={96} style={styles.avatar} />
      ) : (
        <div style={{ ...styles.avatar, ...styles.avatarFallback }}>{initials}</div>
      )}

      <h1 style={styles.heading}>Hello {user.first_name}</h1>
      {user.username && <p style={{ color: "var(--tg-hint)" }}>@{user.username}</p>}

      <dl style={styles.meta}>
        <Row label="Platform" value={platform} />
        <Row label="Bot API" value={version} />
        <Row label="Perf class" value={performanceClass} />
      </dl>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.row}>
      <dt style={{ color: "var(--tg-hint)" }}>{label}</dt>
      <dd style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>{value}</dd>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarFallback: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--tg-button)",
    color: "var(--tg-button-text)",
    fontSize: 40,
    fontWeight: 700,
  },
  heading: { margin: 0, fontSize: 28, fontWeight: 800 },
  meta: {
    marginTop: 16,
    width: "100%",
    maxWidth: 320,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: 12,
    background: "var(--tg-button)10",
    border: "1px solid color-mix(in srgb, var(--tg-hint) 25%, transparent)",
  },
};
