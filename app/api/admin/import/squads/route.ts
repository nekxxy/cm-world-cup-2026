import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdmin, recordImport } from "@/lib/admin";
import { apiFootballConfigured, getSquad, API_SOURCE } from "@/lib/apiFootball";

export const runtime = "nodejs";
export const maxDuration = 60;

// Imports squads. Squads call the API once per team, so to respect rate limits
// this processes a slice: POST ?offset=0&limit=10 (default), repeat until done.
// Returns `remaining` so the admin UI can page through all teams.
export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!apiFootballConfigured()) return NextResponse.json({ error: "api_not_configured" }, { status: 500 });

  const url = new URL(req.url);
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0));
  const limit = Math.min(15, Math.max(1, Number(url.searchParams.get("limit") ?? 10)));

  try {
    await ensureSchema();
    const teams = await sql`SELECT id, name FROM real_teams ORDER BY id`;
    if (teams.length === 0) {
      return NextResponse.json({ error: "no_teams", message: "Import teams first." }, { status: 400 });
    }

    const slice = teams.slice(offset, offset + limit);
    let players = 0;
    let teamsWithSquad = 0;
    for (const t of slice) {
      try {
        const squads = await getSquad(Number(t.id));
        const list = squads[0]?.players ?? [];
        if (list.length > 0) teamsWithSquad++;
        for (const p of list) {
          if (!p?.id) continue;
          await sql`
            INSERT INTO real_players (id, name, team_id, position, number, age, photo, source, last_updated)
            VALUES (${p.id}, ${p.name}, ${Number(t.id)}, ${p.position ?? null}, ${p.number ?? null},
                    ${p.age ?? null}, ${p.photo ?? null}, ${API_SOURCE}, now())
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name, team_id = EXCLUDED.team_id, position = EXCLUDED.position,
              number = EXCLUDED.number, age = EXCLUDED.age, photo = EXCLUDED.photo, last_updated = now()`;
          players++;
        }
      } catch {
        // Skip a failing team (rate limit / no squad yet) and keep going.
      }
    }

    const processed = offset + slice.length;
    const remaining = Math.max(0, teams.length - processed);
    const msg = `Squads ${offset}–${processed}/${teams.length}: ${players} players, ${teamsWithSquad} squads`;
    if (remaining === 0) await recordImport("squads", players > 0 ? "ok" : "empty", players, msg, API_SOURCE);
    return NextResponse.json({ ok: true, processed, remaining, players, teamsWithSquad, total: teams.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    await recordImport("squads", "error", 0, message, API_SOURCE).catch(() => {});
    return NextResponse.json({ error: "import_failed", message }, { status: 500 });
  }
}
