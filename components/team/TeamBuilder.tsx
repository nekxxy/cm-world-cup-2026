"use client";

import { useEffect, useMemo, useState } from "react";
import type { Team } from "@/data/teams";
import { getTeam } from "@/data/teams";
import { PLAYERS, getPlayer, type Player, type Position } from "@/data/players";
import {
  BUDGET,
  SQUAD_SIZE,
  MAX_PER_TEAM,
  POSITION_LIMITS,
  validateSquad,
} from "@/lib/rules";
import { currentRound } from "@/lib/rounds";
import { tgFetch } from "@/telegram/api";
import { hapticImpact, hapticSelection, hapticNotify } from "@/telegram/haptics";
import { useMainButton } from "@/telegram/useTelegramUI";
import TeamCrest from "@/components/TeamCrest";
import Pitch from "./Pitch";

const TABS: (Position | "ALL")[] = ["ALL", "GK", "DEF", "MID", "FWD"];

export default function TeamBuilder({ team, onBack }: { team: Team; onBack: () => void }) {
  const round = currentRound();
  const [ids, setIds] = useState<string[]>([]);
  const [captain, setCaptain] = useState("");
  const [vice, setVice] = useState("");
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("ALL");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load any existing pick for this round.
  useEffect(() => {
    let cancelled = false;
    tgFetch(`/api/picks?round=${round.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setLocked(Boolean(data.locked || data.pick?.locked));
        if (data.pick) {
          setIds(data.pick.players ?? []);
          setCaptain(data.pick.captain ?? "");
          setVice(data.pick.viceCaptain ?? "");
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [round.id]);

  const selected = useMemo(() => ids.map(getPlayer).filter(Boolean) as Player[], [ids]);
  const byPos = useMemo(() => {
    const m: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    selected.forEach((p) => (m[p.position] += 1));
    return m;
  }, [selected]);
  const byTeam = useMemo(() => {
    const m: Record<string, number> = {};
    selected.forEach((p) => (m[p.teamId] = (m[p.teamId] ?? 0) + 1));
    return m;
  }, [selected]);
  const credits = useMemo(
    () => Math.round(selected.reduce((s, p) => s + p.credits, 0) * 10) / 10,
    [selected],
  );
  const validation = useMemo(
    () => validateSquad({ players: ids, captain, viceCaptain: vice }),
    [ids, captain, vice],
  );

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLAYERS.filter((p) => {
      if (tab !== "ALL" && p.position !== tab) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.teamCode.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.credits - a.credits);
  }, [tab, query]);

  function blockReason(p: Player): string | null {
    if (ids.includes(p.id)) return null; // selected → removable, not blocked
    if (locked) return "Locked";
    if (ids.length >= SQUAD_SIZE) return "XI full";
    if (byPos[p.position] >= POSITION_LIMITS[p.position].max) return `${p.position} full`;
    if ((byTeam[p.teamId] ?? 0) >= MAX_PER_TEAM) return `Max ${MAX_PER_TEAM}/team`;
    if (credits + p.credits > BUDGET) return "Over budget";
    return null;
  }

  function toggle(p: Player) {
    if (locked) return;
    if (ids.includes(p.id)) {
      setIds((xs) => xs.filter((x) => x !== p.id));
      if (captain === p.id) setCaptain("");
      if (vice === p.id) setVice("");
      hapticSelection();
    } else if (!blockReason(p)) {
      setIds((xs) => [...xs, p.id]);
      hapticSelection();
    }
    setStatus(null);
  }

  function makeCaptain(id: string) {
    if (locked) return;
    setCaptain(id);
    if (vice === id) setVice("");
    hapticSelection();
  }
  function makeVice(id: string) {
    if (locked) return;
    setVice(id);
    if (captain === id) setCaptain("");
    hapticSelection();
  }

  async function save() {
    if (!validation.ok || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await tgFetch("/api/picks", {
        method: "POST",
        body: JSON.stringify({ round: round.id, players: ids, captain, viceCaptain: vice, teamId: team.id }),
      });
      if (res.ok) {
        hapticNotify("success");
        setStatus("Saved ✓ Your XI is in.");
      } else if (res.status === 401) {
        setStatus("Open the app inside Telegram to save your team.");
      } else if (res.status === 423) {
        setLocked(true);
        setStatus("This round is locked — kickoff has passed.");
      } else {
        const data = await res.json().catch(() => null);
        setStatus(data?.errors?.join(" ") ?? "Could not save. Try again.");
        hapticNotify("error");
      }
    } catch {
      setStatus("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  // Native Telegram MainButton mirrors the in-page Save (fallback for browser).
  useMainButton({
    text: locked ? "Locked" : saving ? "Saving…" : "Save XI",
    visible: !locked,
    active: validation.ok && !saving,
    progress: saving,
    onClick: save,
  });

  const deadline = new Date(round.deadline);

  return (
    <main style={{ minHeight: "100dvh", paddingBottom: 168 }}>
      <div style={S.inner}>
        <div style={S.topbar}>
          <button onClick={() => { hapticImpact("light"); onBack(); }} style={S.back}>← Back</button>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800 }}>{round.name}</div>
            <div style={{ fontSize: 11, color: "var(--color-muted)" }}>
              {locked ? "LOCKED" : `Locks ${deadline.toLocaleDateString()}`}
            </div>
          </div>
        </div>

        <h1 style={S.title}>Build your XI</h1>

        {/* My Team pitch */}
        <Pitch players={selected} captain={captain} viceCaptain={vice} />

        {/* Your XI list with C/VC + remove */}
        {selected.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={S.kicker}>YOUR XI · tap C / V</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selected.map((p) => {
                const t = getTeam(p.teamId)!;
                return (
                  <div key={p.id} className="themed-panel" style={S.selRow}>
                    <TeamCrest team={t} size={20} />
                    <span style={{ width: 34, fontSize: 11, fontWeight: 800, color: "var(--color-muted)" }}>{p.position}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                    <button onClick={() => makeCaptain(p.id)} style={roleBtn(captain === p.id, "#E8C66B")}>C</button>
                    <button onClick={() => makeVice(p.id)} style={roleBtn(vice === p.id, "#ffffff")}>V</button>
                    {!locked && <button onClick={() => toggle(p)} style={S.remove}>✕</button>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Position tabs */}
        <div style={S.tabs}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabActive : null) }}>
              {t}
              {t !== "ALL" && <span style={{ opacity: 0.7 }}> {byPos[t as Position]}/{POSITION_LIMITS[t as Position].max}</span>}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search players or team code…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={S.search}
        />

        {/* Player pool */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
          {pool.slice(0, 80).map((p) => {
            const on = ids.includes(p.id);
            const reason = blockReason(p);
            const t = getTeam(p.teamId)!;
            return (
              <button
                key={p.id}
                onClick={() => toggle(p)}
                disabled={!on && !!reason}
                style={{ ...S.poolRow, ...(on ? S.poolRowOn : null), opacity: !on && reason ? 0.45 : 1 }}
              >
                <TeamCrest team={t} size={22} />
                <span style={{ width: 34, fontSize: 11, fontWeight: 800, color: "var(--color-muted)" }}>{p.position}</span>
                <span style={{ flex: 1, textAlign: "left", fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700, fontSize: 13 }}>{p.credits.toFixed(1)}</span>
                <span style={S.addMark}>{on ? "✓" : reason ?? "+"}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky summary + save */}
      <div style={S.dock}>
        <div style={S.dockRow}>
          <span><b>{ids.length}</b>/{SQUAD_SIZE}</span>
          <span style={{ color: credits > BUDGET ? "#ff6b6b" : "var(--color-text)" }}>
            <b>{credits.toFixed(1)}</b> / {BUDGET.toFixed(0)} cr
          </span>
          <button onClick={save} disabled={!validation.ok || saving || locked} style={S.save}>
            {locked ? "Locked" : saving ? "Saving…" : "Save XI"}
          </button>
        </div>
        {(status || (!validation.ok && loaded && ids.length > 0)) && (
          <div style={S.statusBar}>{status ?? validation.errors[0]}</div>
        )}
      </div>
    </main>
  );
}

function roleBtn(active: boolean, color: string): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 8,
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    background: active ? color : "transparent",
    color: active ? "#1a1a1a" : "var(--color-muted)",
    border: `1px solid ${active ? color : "var(--color-hairline)"}`,
  };
}

const S: Record<string, React.CSSProperties> = {
  inner: { maxWidth: 480, margin: "0 auto", padding: "16px 16px 0" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  back: { background: "transparent", border: "none", color: "var(--color-accent)", fontWeight: 700, fontSize: 15, cursor: "pointer", padding: 0 },
  title: { margin: "4px 0 14px", fontSize: 26, fontWeight: 800 },
  kicker: { fontSize: 11, letterSpacing: 1.5, fontWeight: 700, color: "var(--color-muted)", margin: "0 0 6px 2px" },
  selRow: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" },
  remove: { width: 28, height: 28, borderRadius: 8, background: "transparent", color: "var(--color-muted)", border: "1px solid var(--color-hairline)", cursor: "pointer" },
  tabs: { display: "flex", gap: 6, marginTop: 18, overflowX: "auto" },
  tab: { flex: "1 0 auto", padding: "8px 10px", borderRadius: 999, fontSize: 13, fontWeight: 700, background: "var(--color-panel)", color: "var(--color-text)", border: "1px solid var(--color-hairline)", cursor: "pointer", whiteSpace: "nowrap" },
  tabActive: { background: "var(--color-primary)", color: "var(--color-on-primary)", borderColor: "var(--color-primary)" },
  search: { width: "100%", marginTop: 10, padding: "12px 14px", fontSize: 16, borderRadius: 12, background: "var(--color-panel)", color: "var(--color-text)", border: "1px solid var(--color-hairline)", outline: "none" },
  poolRow: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 12, background: "var(--color-panel)", color: "var(--color-text)", border: "1px solid var(--color-hairline)", cursor: "pointer" },
  poolRowOn: { border: "2px solid var(--color-accent)" },
  addMark: { minWidth: 34, textAlign: "right", fontSize: 12, fontWeight: 800, color: "var(--color-accent)" },
  dock: { position: "fixed", left: 0, right: 0, bottom: "calc(64px + var(--safe-bottom))", zIndex: 40, padding: "10px 16px", background: "color-mix(in srgb, var(--color-bg) 92%, transparent)", backdropFilter: "blur(8px)", borderTop: "1px solid var(--color-hairline)" },
  dockRow: { maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, fontSize: 14 },
  save: { padding: "11px 22px", borderRadius: 999, background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer" },
  statusBar: { maxWidth: 480, margin: "8px auto 0", fontSize: 13, color: "var(--color-muted)", textAlign: "center" },
};
