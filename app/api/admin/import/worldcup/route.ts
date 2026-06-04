import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdmin, recordImport, stageFromRound } from "@/lib/admin";
import { fetchSchedule, fetchTeams, WCU_SOURCE } from "@/lib/worldcupundo";

export const runtime = "nodejs";
export const maxDuration = 60;

type Obj = Record<string, unknown>;
const str = (v: unknown): string | null => (v === undefined || v === null || v === "" ? null : String(v));
const intOrNull = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// Imports real teams + fixtures from WorldCupUndo (ESPN-derived shape).
// Teams: { teams: [{ id, name, shortName, abbreviation, logo, color, alternateColor, location }] }
// Schedule: { matches: [{ id, utcDate, istDate, istTime, istDayKey, status, isLive, isFinished,
//   home:{id,name,short,logo,color,score}, away:{...}, venue:{name,city,country}, round, group }] }
export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    await ensureSchema();

    // --- Teams ---
    const rawTeams = await fetchTeams();
    let teams = 0;
    for (const raw of rawTeams) {
      const t = raw as Obj;
      const id = intOrNull(t.id);
      const name = str(t.name) ?? str(t.shortName);
      if (id === null || !name) continue;
      await sql`
        INSERT INTO real_teams (id, name, short_name, code, country, logo, color, alternate_color, group_label, source, last_updated)
        VALUES (${id}, ${name}, ${str(t.shortName)}, ${str(t.abbreviation)}, ${str(t.location)}, ${str(t.logo)},
                ${str(t.color)}, ${str(t.alternateColor)}, ${str((t as Obj).group)}, ${WCU_SOURCE}, now())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, short_name = EXCLUDED.short_name, code = EXCLUDED.code,
          country = EXCLUDED.country, logo = EXCLUDED.logo, color = EXCLUDED.color,
          alternate_color = EXCLUDED.alternate_color, group_label = COALESCE(EXCLUDED.group_label, real_teams.group_label),
          source = EXCLUDED.source, last_updated = now()`;
      teams++;
    }

    // --- Fixtures ---
    const rawMatches = await fetchSchedule();
    let fixtures = 0;
    let skipped = 0;
    for (const raw of rawMatches) {
      const m = raw as Obj;
      const home = (m.home ?? {}) as Obj;
      const away = (m.away ?? {}) as Obj;
      const venue = (m.venue ?? {}) as Obj;
      const id = intOrNull(m.id);
      const homeName = str(home.name) ?? str(home.short);
      const awayName = str(away.name) ?? str(away.short);
      const utc = str(m.utcDate) ?? str(m.date);
      const when = utc ? new Date(utc) : null;
      if (id === null || !homeName || !awayName || !when || isNaN(when.getTime())) {
        skipped++;
        continue;
      }
      const round = str(m.round);
      const group = str(m.group);
      await sql`
        INSERT INTO real_fixtures (
          id, round, stage, home_team_id, away_team_id, home_name, away_name, home_short, away_short,
          home_logo, away_logo, home_color, away_color, venue_name, city, venue_country, country,
          kickoff, ist_date, ist_time, ist_day_key, status_short, status_long, is_live, is_finished,
          goals_home, goals_away, source, last_updated)
        VALUES (
          ${id}, ${round}, ${stageFromRound((round ?? group) ?? undefined)},
          ${intOrNull(home.id)}, ${intOrNull(away.id)}, ${homeName}, ${awayName}, ${str(home.short)}, ${str(away.short)},
          ${str(home.logo)}, ${str(away.logo)}, ${str(home.color)}, ${str(away.color)},
          ${str(venue.name)}, ${str(venue.city)}, ${str(venue.country)}, ${str(venue.country)},
          ${when.toISOString()}, ${str(m.istDate)}, ${str(m.istTime)}, ${str(m.istDayKey)},
          ${str(m.statusShort) ?? str(m.status)}, ${str(m.status)},
          ${Boolean(m.isLive)}, ${Boolean(m.isFinished)},
          ${intOrNull(home.score)}, ${intOrNull(away.score)}, ${WCU_SOURCE}, now())
        ON CONFLICT (id) DO UPDATE SET
          round = EXCLUDED.round, stage = EXCLUDED.stage, home_name = EXCLUDED.home_name,
          away_name = EXCLUDED.away_name, home_short = EXCLUDED.home_short, away_short = EXCLUDED.away_short,
          home_logo = EXCLUDED.home_logo, away_logo = EXCLUDED.away_logo, home_color = EXCLUDED.home_color,
          away_color = EXCLUDED.away_color, venue_name = EXCLUDED.venue_name, city = EXCLUDED.city,
          venue_country = EXCLUDED.venue_country, country = EXCLUDED.country, kickoff = EXCLUDED.kickoff,
          ist_date = EXCLUDED.ist_date, ist_time = EXCLUDED.ist_time, ist_day_key = EXCLUDED.ist_day_key,
          status_short = EXCLUDED.status_short, status_long = EXCLUDED.status_long, is_live = EXCLUDED.is_live,
          is_finished = EXCLUDED.is_finished, goals_home = EXCLUDED.goals_home, goals_away = EXCLUDED.goals_away,
          source = EXCLUDED.source, last_updated = now()`;
      fixtures++;
    }

    await recordImport("teams", teams > 0 ? "ok" : "empty", teams, `WorldCupUndo: ${teams} teams`, WCU_SOURCE);
    await recordImport("fixtures", fixtures > 0 ? "ok" : "empty", fixtures, `WorldCupUndo: ${fixtures} fixtures, ${skipped} skipped`, WCU_SOURCE);

    return NextResponse.json({ ok: true, teams, fixtures, skipped });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    await recordImport("fixtures", "error", 0, message, WCU_SOURCE).catch(() => {});
    return NextResponse.json({ error: "import_failed", message }, { status: 500 });
  }
}
