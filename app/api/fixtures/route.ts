import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

export const runtime = "nodejs";

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
    return NextResponse.json({ count: rows.length, fixtures: rows });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "server_error", message, fixtures: [] }, { status: 500 });
  }
}
