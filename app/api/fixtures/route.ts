import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "nodejs";

// Some early rows accidentally stored a stringified object in a text column.
// Recover gracefully: if a value is JSON like {"name":...,"short":...}, pull
// the readable field instead of showing raw JSON. (Re-importing fixes the data
// at the source; this just keeps the UI clean meanwhile.)
function clean(v: unknown, prefer: "name" | "short" = "name"): string | null {
  if (v == null) return null;
  const s = String(v);
  if (s.startsWith("{") || s.startsWith("[")) {
    try {
      const o = JSON.parse(s) as Record<string, unknown>;
      return (o[prefer] ?? o.name ?? o.short ?? null) as string | null;
    } catch {
      return s;
    }
  }
  return s;
}

// Public read of imported real fixtures. Returns [] when none are loaded yet —
// the UI shows a clean "fixtures pending import" empty state, never fakes.
export async function GET() {
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT id, round, stage, home_team_id, away_team_id,
             home_name, away_name, home_short, away_short, home_logo, away_logo,
             home_color, away_color, venue_name, city, venue_country,
             kickoff, ist_date, ist_time, ist_day_key,
             status_short, status_long, is_live, is_finished,
             goals_home, goals_away, source, last_updated
      FROM real_fixtures
      ORDER BY kickoff NULLS LAST, id`;
    const fixtures = rows.map((r) => ({
      ...r,
      home_name: clean(r.home_name),
      away_name: clean(r.away_name),
      home_short: clean(r.home_short, "short") ?? clean(r.home_name, "short"),
      away_short: clean(r.away_short, "short") ?? clean(r.away_name, "short"),
      venue_name: clean(r.venue_name),
    }));
    return NextResponse.json({ count: fixtures.length, fixtures });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "server_error", message, fixtures: [] }, { status: 500 });
  }
}
