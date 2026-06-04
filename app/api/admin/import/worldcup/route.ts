import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { isAdmin, recordImport, stageFromRound } from "@/lib/admin";
import { fetchSchedule, fetchTeams, pick, pickNested, WCU_SOURCE } from "@/lib/worldcupundo";

export const runtime = "nodejs";
export const maxDuration = 60;

// Imports real teams + fixtures from WorldCupUndo. Maps likely field names;
// rows that lack the essentials (team names / a parseable kickoff) are SKIPPED
// rather than guessed. Returns counts + a raw sample so the mapping can be
// confirmed and tightened on the next pass. Kickoffs are stored in UTC and
// rendered in IST in the UI.
export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    await ensureSchema();

    // --- Teams ---
    const rawTeams = await fetchTeams();
    let teams = 0;
    let teamId = 1;
    for (const t of rawTeams) {
      const name = pick<string>(t, ["name", "team", "country", "title"]);
      if (!name) continue;
      const idVal = pick(t, ["id", "teamId", "code", "fifaCode"]);
      const id = Number(idVal);
      const finalId = Number.isFinite(id) && id > 0 ? id : teamId++;
      const code = pick<string>(t, ["code", "fifaCode", "abbr", "shortName"]) ?? null;
      const group = pick<string>(t, ["group", "groupName", "groupLetter", "pool"]) ?? null;
      const logo = pick<string>(t, ["flag", "logo", "crest", "image", "flagUrl"]) ?? null;
      await sql`
        INSERT INTO real_teams (id, name, code, country, group_label, logo, source, last_updated)
        VALUES (${finalId}, ${name}, ${code}, ${name}, ${group}, ${logo}, ${WCU_SOURCE}, now())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, code = EXCLUDED.code, group_label = EXCLUDED.group_label,
          logo = EXCLUDED.logo, source = EXCLUDED.source, last_updated = now()`;
      teams++;
    }

    // --- Fixtures ---
    const rawMatches = await fetchSchedule();
    let fixtures = 0;
    let skipped = 0;
    let synthId = 1;
    for (const m of rawMatches) {
      const home = pick<string>(m, ["homeTeam", "home", "team1", "homeName"]) ??
        pickNested(m, [["teams", "home", "name"], ["home", "name"], ["home", "team"]]);
      const away = pick<string>(m, ["awayTeam", "away", "team2", "awayName"]) ??
        pickNested(m, [["teams", "away", "name"], ["away", "name"], ["away", "team"]]);
      const dateRaw = pick(m, ["kickoff", "date", "datetime", "utcDate", "utcKickoff", "time", "startTime", "dateTime"]);
      const when = dateRaw ? new Date(String(dateRaw)) : null;
      const validDate = when && !isNaN(when.getTime());
      if (!home || !away || !validDate) {
        skipped++;
        continue;
      }
      const idVal = Number(pick(m, ["id", "matchId", "matchNumber", "number"]));
      const id = Number.isFinite(idVal) && idVal > 0 ? idVal : 900000 + synthId++;
      const round = pick<string>(m, ["round", "stage", "group", "phase"]) ?? null;
      const venue = pick<string>(m, ["venue", "stadium", "venueName"]) ?? pickNested(m, [["venue", "name"]]) ?? null;
      const city = pick<string>(m, ["city", "location", "venueCity"]) ?? pickNested(m, [["venue", "city"]]) ?? null;
      const country = pick<string>(m, ["country", "hostCountry"]) ?? null;
      const status = pick<string>(m, ["status", "matchStatus", "state"]) ?? "scheduled";
      const gh = pick(m, ["homeScore", "homeGoals"]); const ga = pick(m, ["awayScore", "awayGoals"]);
      await sql`
        INSERT INTO real_fixtures (id, round, stage, home_name, away_name, venue_name, city, country,
          kickoff, status_short, status_long, goals_home, goals_away, source, last_updated)
        VALUES (${id}, ${round}, ${stageFromRound(round ?? undefined)}, ${home}, ${away}, ${venue}, ${city},
          ${country}, ${when!.toISOString()}, ${String(status)}, ${String(status)},
          ${gh != null ? Number(gh) : null}, ${ga != null ? Number(ga) : null}, ${WCU_SOURCE}, now())
        ON CONFLICT (id) DO UPDATE SET
          round = EXCLUDED.round, stage = EXCLUDED.stage, home_name = EXCLUDED.home_name,
          away_name = EXCLUDED.away_name, venue_name = EXCLUDED.venue_name, city = EXCLUDED.city,
          country = EXCLUDED.country, kickoff = EXCLUDED.kickoff, status_short = EXCLUDED.status_short,
          goals_home = EXCLUDED.goals_home, goals_away = EXCLUDED.goals_away, source = EXCLUDED.source,
          last_updated = now()`;
      fixtures++;
    }

    await recordImport("teams", teams > 0 ? "ok" : "empty", teams, `WorldCupUndo: ${teams} teams`, WCU_SOURCE);
    await recordImport("fixtures", fixtures > 0 ? "ok" : "empty", fixtures, `WorldCupUndo: ${fixtures} fixtures, ${skipped} skipped`, WCU_SOURCE);

    return NextResponse.json({
      ok: true,
      teams,
      fixtures,
      skipped,
      // Raw samples so the field mapping can be verified after the first run.
      sampleTeam: rawTeams[0] ?? null,
      sampleMatch: rawMatches[0] ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    await recordImport("fixtures", "error", 0, message, WCU_SOURCE).catch(() => {});
    return NextResponse.json({ error: "import_failed", message }, { status: 500 });
  }
}
