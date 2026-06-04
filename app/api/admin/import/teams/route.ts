import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdmin, recordImport } from "@/lib/admin";
import { apiFootballConfigured, getWorldCupTeams, API_SOURCE } from "@/lib/apiFootball";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!apiFootballConfigured()) return NextResponse.json({ error: "api_not_configured" }, { status: 500 });

  try {
    await ensureSchema();
    const entries = await getWorldCupTeams();
    let teams = 0;
    let venues = 0;
    for (const e of entries) {
      const t = e.team;
      if (!t?.id) continue;
      await sql`
        INSERT INTO real_teams (id, name, code, country, logo, source, last_updated)
        VALUES (${t.id}, ${t.name}, ${t.code ?? null}, ${t.country ?? null}, ${t.logo ?? null}, ${API_SOURCE}, now())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, code = EXCLUDED.code, country = EXCLUDED.country,
          logo = EXCLUDED.logo, source = EXCLUDED.source, last_updated = now()`;
      teams++;
      const v = e.venue;
      if (v?.id) {
        await sql`
          INSERT INTO venues (id, name, city, country, image, source, last_updated)
          VALUES (${v.id}, ${v.name ?? null}, ${v.city ?? null}, ${t.country ?? null}, ${v.image ?? null}, ${API_SOURCE}, now())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name, city = EXCLUDED.city, image = EXCLUDED.image, last_updated = now()`;
        venues++;
      }
    }
    const msg = `Imported ${teams} teams, ${venues} venues`;
    await recordImport("teams", teams > 0 ? "ok" : "empty", teams, msg, API_SOURCE);
    return NextResponse.json({ ok: true, teams, venues, raw: entries.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    await recordImport("teams", "error", 0, message, API_SOURCE).catch(() => {});
    return NextResponse.json({ error: "import_failed", message }, { status: 500 });
  }
}
