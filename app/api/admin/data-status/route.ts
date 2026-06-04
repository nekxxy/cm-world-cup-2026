import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { apiFootballConfigured, API_SOURCE } from "@/lib/apiFootball";

export const runtime = "nodejs";

// Snapshot of what real data is loaded, with provenance + freshness.
export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  try {
    await ensureSchema();
    const [teams, fixtures, players, venues] = await Promise.all([
      sql`SELECT count(*)::int AS n FROM real_teams`,
      sql`SELECT count(*)::int AS n FROM real_fixtures`,
      sql`SELECT count(*)::int AS n FROM real_players`,
      sql`SELECT count(*)::int AS n FROM venues`,
    ]);
    const sources = await sql`SELECT key, source, status, count, message, last_sync FROM data_sources ORDER BY key`;
    const logs = await sql`SELECT kind, status, count, message, created_at FROM import_logs ORDER BY id DESC LIMIT 10`;

    return NextResponse.json({
      configured: apiFootballConfigured(),
      source: API_SOURCE,
      counts: {
        teams: teams[0].n,
        fixtures: fixtures[0].n,
        players: players[0].n,
        venues: venues[0].n,
      },
      sources,
      recentLogs: logs,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: "server_error", message }, { status: 500 });
  }
}
