"use client";

import { useCallback, useState } from "react";

interface Status {
  configured: boolean;
  source: string;
  counts: { teams: number; fixtures: number; players: number; venues: number };
  sources: { key: string; status: string; count: number; message: string; last_sync: string | null }[];
  recentLogs: { kind: string; status: string; count: number; message: string; created_at: string }[];
}

export default function AdminClient() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const headers = useCallback(() => ({ "x-admin-secret": secret }), [secret]);
  const say = (m: string) => setLog((l) => [`${new Date().toLocaleTimeString()} ${m}`, ...l].slice(0, 40));

  const refresh = useCallback(async () => {
    const r = await fetch("/api/admin/data-status", { headers: headers() });
    if (r.ok) setStatus(await r.json());
    else say(`status: ${r.status}`);
  }, [headers]);

  async function importTeams() {
    setBusy(true);
    say("Importing teams…");
    const r = await fetch("/api/admin/import/teams", { method: "POST", headers: headers() });
    const d = await r.json().catch(() => ({}));
    say(`teams → ${r.status} ${JSON.stringify(d)}`);
    await refresh();
    setBusy(false);
  }

  async function importFixtures() {
    setBusy(true);
    say("Importing fixtures…");
    const r = await fetch("/api/admin/import/fixtures", { method: "POST", headers: headers() });
    const d = await r.json().catch(() => ({}));
    say(`fixtures → ${r.status} ${JSON.stringify(d)}`);
    await refresh();
    setBusy(false);
  }

  async function importSquads() {
    setBusy(true);
    say("Importing squads (paged)…");
    let offset = 0;
    for (let guard = 0; guard < 20; guard++) {
      const r = await fetch(`/api/admin/import/squads?offset=${offset}&limit=10`, { method: "POST", headers: headers() });
      const d = await r.json().catch(() => ({}));
      say(`squads ${offset} → ${r.status} ${JSON.stringify(d)}`);
      if (!r.ok || typeof d.remaining !== "number") break;
      offset = d.processed;
      if (d.remaining === 0) break;
    }
    await refresh();
    setBusy(false);
  }

  return (
    <main style={S.wrap}>
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>WC26 Admin</h1>
      <p style={{ color: "var(--color-muted)", fontSize: 13, margin: "0 0 16px" }}>
        Import real World Cup 2026 data from the football API. Enter the admin secret to authorise.
      </p>

      <input
        type="password"
        placeholder="Admin secret"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        style={S.input}
      />

      <div style={S.row}>
        <button onClick={refresh} disabled={!secret} style={S.btn}>Refresh status</button>
        <button onClick={importTeams} disabled={!secret || busy} style={S.btn}>Import teams</button>
        <button onClick={importFixtures} disabled={!secret || busy} style={S.btn}>Import fixtures</button>
        <button onClick={importSquads} disabled={!secret || busy} style={S.btn}>Import squads</button>
      </div>

      {status && (
        <section style={S.panel}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>
            Source: {status.source} · API key {status.configured ? "✓ set" : "✗ missing"}
          </div>
          <div style={S.counts}>
            <Count label="Teams" n={status.counts.teams} />
            <Count label="Fixtures" n={status.counts.fixtures} />
            <Count label="Players" n={status.counts.players} />
            <Count label="Venues" n={status.counts.venues} />
          </div>
          {status.sources.length > 0 && (
            <table style={S.table}>
              <tbody>
                {status.sources.map((s) => (
                  <tr key={s.key}>
                    <td style={S.td}><b>{s.key}</b></td>
                    <td style={S.td}>{s.status}</td>
                    <td style={S.td}>{s.count}</td>
                    <td style={S.td}>{s.last_sync ? new Date(s.last_sync).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <section style={S.panel}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Log</div>
        <pre style={S.pre}>{log.join("\n") || "—"}</pre>
      </section>
    </main>
  );
}

function Count({ label, n }: { label: string; n: number }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: n > 0 ? "var(--color-accent)" : "var(--color-muted)" }}>{n}</div>
      <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{label}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 560, margin: "0 auto", padding: 20 },
  input: { width: "100%", padding: "12px 14px", fontSize: 16, borderRadius: 10, background: "var(--color-panel)", color: "var(--color-text)", border: "1px solid var(--color-hairline)", marginBottom: 12 },
  row: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  btn: { padding: "10px 14px", borderRadius: 10, background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" },
  panel: { background: "var(--color-panel)", border: "1px solid var(--color-hairline)", borderRadius: 12, padding: 14, marginBottom: 12 },
  counts: { display: "flex", gap: 8, marginBottom: 10 },
  table: { width: "100%", fontSize: 12, borderCollapse: "collapse" },
  td: { padding: "4px 6px", borderTop: "1px solid var(--color-hairline)" },
  pre: { whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 11, color: "var(--color-muted)", margin: 0, maxHeight: 260, overflow: "auto" },
};
