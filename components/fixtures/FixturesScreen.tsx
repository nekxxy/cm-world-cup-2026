"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { hapticSelection } from "@/telegram/haptics";

interface Fixture {
  id: number;
  round: string | null;
  stage: string | null;
  home_name: string;
  away_name: string;
  home_short: string | null;
  away_short: string | null;
  home_logo: string | null;
  away_logo: string | null;
  home_color: string | null;
  away_color: string | null;
  venue_name: string | null;
  city: string | null;
  venue_country: string | null;
  kickoff: string | null;
  ist_date: string | null;
  ist_time: string | null;
  ist_day_key: string | null;
  status_short: string | null;
  is_live: boolean | null;
  is_finished: boolean | null;
  goals_home: number | null;
  goals_away: number | null;
}

type Filter = "all" | "today" | "upcoming" | "completed";

const TZ = "Asia/Kolkata";
function istDayKeyNow(): string {
  // YYYY-MM-DD in IST for the "Today" filter.
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return parts; // en-CA → 2026-06-12
}

export default function FixturesScreen() {
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [activeDay, setActiveDay] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/fixtures")
      .then((r) => r.json())
      .then((d) => setFixtures(d.fixtures ?? []))
      .catch(() => setError(true));
  }, []);

  const todayKey = istDayKeyNow();
  const nextId = useMemo(() => {
    if (!fixtures) return null;
    const now = Date.now();
    const upcoming = fixtures
      .filter((f) => f.kickoff && new Date(f.kickoff).getTime() > now && !f.is_finished)
      .sort((a, b) => new Date(a.kickoff!).getTime() - new Date(b.kickoff!).getTime());
    return upcoming[0]?.id ?? null;
  }, [fixtures]);

  const filtered = useMemo(() => {
    if (!fixtures) return [];
    const now = Date.now();
    const q = query.trim().toLowerCase();
    return fixtures.filter((f) => {
      if (q && !`${f.home_name} ${f.away_name} ${f.venue_name ?? ""} ${f.city ?? ""}`.toLowerCase().includes(q)) return false;
      if (filter === "today") return f.ist_day_key === todayKey;
      if (filter === "completed") return Boolean(f.is_finished);
      if (filter === "upcoming") return !f.is_finished && (!f.kickoff || new Date(f.kickoff).getTime() >= now);
      return true;
    });
  }, [fixtures, filter, query, todayKey]);

  // Group by IST day for the sticky day tabs.
  const days = useMemo(() => {
    const map = new Map<string, Fixture[]>();
    for (const f of filtered) {
      const key = f.ist_day_key ?? "tbd";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  if (error) {
    return <EmptyState icon="📡" title="Couldn’t load fixtures" message="The fixtures service is unavailable right now. Please try again shortly." />;
  }
  if (fixtures === null) {
    return <div style={{ padding: 24, color: "var(--color-muted)", textAlign: "center" }}>Loading fixtures…</div>;
  }
  if (fixtures.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="Fixtures pending import"
        message="No real World Cup 2026 matches have been imported yet. An admin can load them from /admin. Nothing placeholder is shown."
      />
    );
  }

  return (
    <div style={S.wrap}>
      <h1 style={S.h1}>Fixtures</h1>

      <div style={S.filters}>
        {(["all", "today", "upcoming", "completed"] as Filter[]).map((f) => (
          <button key={f} onClick={() => { hapticSelection(); setFilter(f); }} style={{ ...S.chip, ...(filter === f ? S.chipOn : null) }}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <input type="search" placeholder="Search team, venue, city…" value={query} onChange={(e) => setQuery(e.target.value)} style={S.search} />

      {/* Sticky day tabs */}
      {days.length > 1 && (
        <div style={S.dayTabs}>
          {days.map(([key, list]) => (
            <button
              key={key}
              onClick={() => { hapticSelection(); setActiveDay(activeDay === key ? null : key); }}
              style={{ ...S.dayTab, ...(activeDay === key ? S.dayTabOn : null) }}
            >
              {list[0]?.ist_date?.replace(/,.*/, "") ?? key} · {key.slice(5)}
            </button>
          ))}
        </div>
      )}

      {days.length === 0 && <EmptyState icon="🔍" title="No matches" message="No fixtures match this filter or search." />}

      {days
        .filter(([key]) => !activeDay || key === activeDay)
        .map(([key, list]) => (
          <section key={key} style={{ marginTop: 14 }}>
            <div style={S.dayHeader}>{list[0]?.ist_date ?? key} · IST</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {list.map((f) => (
                <Row key={f.id} f={f} isNext={f.id === nextId} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}

function Row({ f, isNext }: { f: Fixture; isNext: boolean }) {
  const live = f.is_live;
  const done = f.is_finished;
  const score = done || live ? `${f.goals_home ?? 0}–${f.goals_away ?? 0}` : null;

  return (
    <div className="themed-panel" style={{ ...S.row, ...(isNext ? S.rowNext : null) }}>
      <div style={S.side}>
        <Logo url={f.home_logo} />
        <span style={S.team}>{f.home_short ?? f.home_name}</span>
      </div>

      <div style={S.center}>
        {score ? (
          <div style={S.score}>{score}</div>
        ) : (
          <div style={S.time}>{f.ist_time ?? "TBD"}</div>
        )}
        {live ? (
          <span style={{ ...S.pill, background: "#e5484d", color: "#fff" }}>LIVE</span>
        ) : done ? (
          <span style={{ ...S.pill, background: "var(--color-hairline)", color: "var(--color-muted)" }}>FT</span>
        ) : isNext ? (
          <span style={{ ...S.pill, background: "var(--color-accent)", color: "#0e0f13" }}>NEXT</span>
        ) : (
          <span style={{ fontSize: 10, color: "var(--color-muted)" }}>{f.ist_time ? "IST" : ""}</span>
        )}
      </div>

      <div style={{ ...S.side, justifyContent: "flex-end" }}>
        <span style={S.team}>{f.away_short ?? f.away_name}</span>
        <Logo url={f.away_logo} />
      </div>

      {(f.venue_name || f.city) && (
        <div style={S.venue}>{[f.venue_name, f.city].filter(Boolean).join(" · ")}</div>
      )}
    </div>
  );
}

function Logo({ url }: { url: string | null }) {
  const [ok, setOk] = useState(true);
  if (!url || !ok) return <div style={S.logoFallback} aria-hidden />;
  return <img src={url} alt="" width={24} height={24} loading="lazy" style={{ width: 24, height: 24, objectFit: "contain" }} onError={() => setOk(false)} />;
}

const S: Record<string, React.CSSProperties> = {
  wrap: { maxWidth: 480, margin: "0 auto", padding: 16 },
  h1: { fontSize: 24, fontWeight: 800, margin: "0 0 12px" },
  filters: { display: "flex", gap: 6, marginBottom: 10 },
  chip: { flex: 1, padding: "8px 6px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: "var(--color-panel)", color: "var(--color-text)", border: "1px solid var(--color-hairline)", cursor: "pointer" },
  chipOn: { background: "var(--color-primary)", color: "var(--color-on-primary)", borderColor: "var(--color-primary)" },
  search: { width: "100%", padding: "11px 14px", fontSize: 16, borderRadius: 12, background: "var(--color-panel)", color: "var(--color-text)", border: "1px solid var(--color-hairline)", outline: "none" },
  dayTabs: { display: "flex", gap: 6, overflowX: "auto", position: "sticky", top: "calc(var(--safe-top) + 4px)", zIndex: 2, padding: "10px 0", background: "var(--color-bg)" },
  dayTab: { flex: "0 0 auto", padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: "var(--color-panel)", color: "var(--color-muted)", border: "1px solid var(--color-hairline)", cursor: "pointer", whiteSpace: "nowrap" },
  dayTabOn: { color: "var(--color-on-primary)", background: "var(--color-primary)", borderColor: "var(--color-primary)" },
  dayHeader: { fontSize: 12, fontWeight: 700, color: "var(--color-muted)", margin: "0 0 8px 2px", letterSpacing: 0.5 },
  row: { display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8, padding: "12px 14px" },
  rowNext: { border: "2px solid var(--color-accent)" },
  side: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  team: { fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  center: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 56 },
  time: { fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" },
  score: { fontSize: 16, fontWeight: 900, fontVariantNumeric: "tabular-nums" },
  pill: { fontSize: 9, fontWeight: 900, letterSpacing: 0.5, padding: "1px 6px", borderRadius: 999 },
  venue: { gridColumn: "1 / -1", fontSize: 11, color: "var(--color-muted)", textAlign: "center", marginTop: 4 },
  logoFallback: { width: 24, height: 24, borderRadius: "50%", background: "var(--color-hairline)" },
};
