import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdmin, recordImport, stageFromRound } from "@/lib/admin";
import { apiFootballConfigured, getWorldCupFixtures, API_SOURCE } from "@/lib/apiFootball";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!apiFootballConfigured()) return NextResponse.json({ error: "api_not_configured" }, { status: 500 });

  try {
    await ensureSchema();
    const entries = await getWorldCupFixtures();
    let n = 0;
    for (const e of entries) {
      const f = e.fixture;
      if (!f?.id) continue;
      await sql`
        INSERT INTO real_fixtures (
          id, round, stage, home_team_id, away_team_id, home_name, away_name,
          home_logo, away_logo, venue_id, venue_name, city, country, kickoff,
          status_short, status_long, goals_home, goals_away, source, last_updated)
        VALUES (
          ${f.id}, ${e.league?.round ?? null}, ${stageFromRound(e.league?.round)},
          ${e.teams?.home?.id ?? null}, ${e.teams?.away?.id ?? null},
          ${e.teams?.home?.name ?? null}, ${e.teams?.away?.name ?? null},
          ${e.teams?.home?.logo ?? null}, ${e.teams?.away?.logo ?? null},
          ${f.venue?.id ?? null}, ${f.venue?.name ?? null}, ${f.venue?.city ?? null},
          ${e.league?.country ?? null}, ${f.date ?? null},
          ${f.status?.short ?? null}, ${f.status?.long ?? null},
          ${e.goals?.home ?? null}, ${e.goals?.away ?? null}, ${API_SOURCE}, now())
        ON CONFLICT (id) DO UPDATE SET
          round = EXCLUDED.round, stage = EXCLUDED.stage,
          home_team_id = EXCLUDED.home_team_id, away_team_id = EXCLUDED.away_team_id,
          home_name = EXCLUDED.home_name, away_name = EXCLUDED.away_name,
          home_logo = EXCLUDED.home_logo, away_logo = EXCLUDED.away_logo,
          venue_id = EXCLUDED.venue_id, venue_name = EXCLUDED.venue_name,
          city = EXCLUDED.city, country = EXCLUDED.country, kickoff = EXCLUDED.kickoff,
          status_short = EXCLUDED.status_short, status_long = EXCLUDED.status_long,
          goals_home = EXCLUDED.goals_home, goals_away = EXCLUDED.goals_away,
          source = EXCLUDED.source, last_updated = now()`;
      n++;
    }
    const msg = `Imported ${n} fixtures`;
    await recordImport("fixtures", n > 0 ? "ok" : "empty", n, msg, API_SOURCE);
    return NextResponse.json({ ok: true, fixtures: n });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    await recordImport("fixtures", "error", 0, message, API_SOURCE).catch(() => {});
    return NextResponse.json({ error: "import_failed", message }, { status: 500 });
  }
}
