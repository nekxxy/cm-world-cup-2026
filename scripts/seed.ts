/**
 * Build-time seed: fetch the WC2026 dataset from API-Football ONCE, normalise
 * it, and write data/wc2026.json (committed). The app then runs fully offline
 * from that file.
 *
 *   npm run seed            # uses API_FOOTBALL_KEY from .env.local / .env
 *
 * KEYLESS: with no API_FOOTBALL_KEY set, this writes a valid seed containing
 * the (verified) host-city venues plus EMPTY teams/groups/matches and a
 * "seed-pending" marker. We never fabricate teams, groups, fixtures or times.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { VENUES } from "../lib/venues";
import type {
  Group,
  GroupStanding,
  Match,
  Stage,
  Team,
  WCData,
} from "../lib/types";

// Best-effort env loading for a standalone (non-Next) script.
for (const f of [".env", ".env.local"]) {
  try {
    (process as NodeJS.Process & { loadEnvFile: (p: string) => void }).loadEnvFile(f);
  } catch {
    /* file absent — fine */
  }
}

const API_KEY = process.env.API_FOOTBALL_KEY?.trim();
const LEAGUE = 1;
const SEASON = 2026;
const BASE = "https://v3.football.api-sports.io";
const OUT = resolve(process.cwd(), "data", "wc2026.json");

// ── API response shapes (only the fields we consume) ───────────────────────
interface ApiEnvelope<T> {
  errors?: unknown;
  results?: number;
  response: T;
}
interface ApiTeam {
  team: { id: number; name: string; code: string | null; logo: string | null };
}
interface ApiStandingRow {
  rank: number;
  team: { id: number; name: string; logo: string | null };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}
interface ApiStandings {
  league: { standings: ApiStandingRow[][] };
}
interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
    venue: { id: number | null; name: string | null; city: string | null };
  };
  league: { round: string };
  teams: { home: { id: number | null }; away: { id: number | null } };
  goals: { home: number | null; away: number | null };
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": API_KEY as string },
  });
  if (!res.ok) throw new Error(`API ${path} → ${res.status} ${res.statusText}`);
  const json = (await res.json()) as ApiEnvelope<T>;
  if (json.errors && Object.keys(json.errors as object).length) {
    throw new Error(`API ${path} errors: ${JSON.stringify(json.errors)}`);
  }
  return json.response;
}

// ── Normalisers ─────────────────────────────────────────────────────────────

const GROUP_RE = /group\s+([A-L])/i;

function mapStage(round: string): { stage: Stage; groupId: string | null } {
  const r = round.toLowerCase();
  const g = round.match(GROUP_RE);
  if (g) return { stage: "group", groupId: g[1].toUpperCase() };
  if (r.includes("round of 32")) return { stage: "r32", groupId: null };
  if (r.includes("round of 16")) return { stage: "r16", groupId: null };
  if (r.includes("quarter")) return { stage: "qf", groupId: null };
  if (r.includes("semi")) return { stage: "sf", groupId: null };
  if (r.includes("3rd") || r.includes("third")) return { stage: "3rd", groupId: null };
  if (r.includes("final")) return { stage: "final", groupId: null };
  return { stage: "group", groupId: null };
}

const LIVE = new Set(["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const DONE = new Set(["FT", "AET", "PEN", "AWD", "WO"]);
function mapStatus(short: string): Match["status"] {
  if (LIVE.has(short)) return "live";
  if (DONE.has(short)) return "finished";
  return "scheduled";
}

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Match an API fixture venue to one of our 16 host venues, by stadium name
// first (most stable), then city, with aliases for known naming differences.
const CITY_ALIASES: Record<string, string> = {
  "east rutherford": "new-york-nj",
  "new york": "new-york-nj",
  inglewood: "los-angeles",
  arlington: "dallas",
  foxborough: "boston",
  "foxboro": "boston",
  "santa clara": "san-francisco",
  zapopan: "guadalajara",
  "guadalupe": "monterrey",
};
const venueByStadium = new Map(VENUES.map((v) => [norm(v.stadium), v.id]));
const venueByCity = new Map(VENUES.map((v) => [norm(v.city), v.id]));

function mapVenue(name: string | null, city: string | null): string | null {
  if (name) {
    const byName = venueByStadium.get(norm(name));
    if (byName) return byName;
  }
  if (city) {
    const c = norm(city);
    if (venueByCity.has(c)) return venueByCity.get(c)!;
    if (CITY_ALIASES[c]) return CITY_ALIASES[c];
  }
  return null; // unknown — better null than wrong (no fabrication)
}

function normalizeTeams(rows: ApiTeam[], teamGroup: Map<number, string>): Team[] {
  return rows.map((r) => ({
    id: r.team.id,
    name: r.team.name,
    code: r.team.code,
    flagUrl: r.team.logo, // national-team "logo" is the flag
    logoUrl: r.team.logo,
    fifaRank: null, // TODO: source from API (not in /teams or /standings)
    groupId: teamGroup.get(r.team.id) ?? null,
    colors: null,
  }));
}

function normalizeStandings(blocks: ApiStandingRow[][]): {
  groups: Group[];
  teamGroup: Map<number, string>;
} {
  const teamGroup = new Map<number, string>();
  const byGroup = new Map<string, GroupStanding[]>();

  for (const block of blocks) {
    for (const row of block) {
      const letter = row.group.match(GROUP_RE)?.[1]?.toUpperCase();
      if (!letter) continue;
      teamGroup.set(row.team.id, letter);
      const standing: GroupStanding = {
        teamId: row.team.id,
        rank: row.rank,
        played: row.all.played,
        win: row.all.win,
        draw: row.all.draw,
        lose: row.all.lose,
        goalsFor: row.all.goals.for,
        goalsAgainst: row.all.goals.against,
        goalDiff: row.goalsDiff,
        points: row.points,
        form: row.form,
      };
      const list = byGroup.get(letter) ?? [];
      list.push(standing);
      byGroup.set(letter, list);
    }
  }

  const groups: Group[] = [...byGroup.keys()].sort().map((id) => {
    const standings = byGroup.get(id)!.sort((a, b) => a.rank - b.rank);
    return { id, teamIds: standings.map((s) => s.teamId), standings };
  });
  return { groups, teamGroup };
}

function normalizeFixtures(rows: ApiFixture[]): Match[] {
  return rows
    .map((r): Match => {
      const { stage, groupId } = mapStage(r.league.round);
      return {
        id: r.fixture.id,
        stage,
        groupId,
        round: r.league.round,
        homeTeamId: r.teams.home.id,
        awayTeamId: r.teams.away.id,
        venueId: mapVenue(r.fixture.venue.name, r.fixture.venue.city),
        kickoffUtc: new Date(r.fixture.date).toISOString(),
        status: mapStatus(r.fixture.status.short),
        homeScore: r.goals.home,
        awayScore: r.goals.away,
        minute: r.fixture.status.elapsed,
      };
    })
    .sort((a, b) => Date.parse(a.kickoffUtc) - Date.parse(b.kickoffUtc));
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  let teams: Team[] = [];
  let groups: Group[] = [];
  let matches: Match[] = [];
  let source: WCData["meta"]["source"] = "seed-pending";
  let note: string | undefined =
    "Keyless seed — venues are real (Appendix A). Set API_FOOTBALL_KEY and run `npm run seed` to populate teams, groups and fixtures. No sports data is fabricated.";

  if (API_KEY) {
    console.log("→ API_FOOTBALL_KEY found. Fetching WC2026 from API-Football…");
    const [teamRows, standingRows, fixtureRows] = await Promise.all([
      apiGet<ApiTeam[]>(`/teams?league=${LEAGUE}&season=${SEASON}`),
      apiGet<ApiStandings[]>(`/standings?league=${LEAGUE}&season=${SEASON}`),
      apiGet<ApiFixture[]>(`/fixtures?league=${LEAGUE}&season=${SEASON}`),
    ]);

    const blocks = standingRows[0]?.league.standings ?? [];
    const { groups: g, teamGroup } = normalizeStandings(blocks);
    groups = g;
    teams = normalizeTeams(teamRows, teamGroup);
    matches = normalizeFixtures(fixtureRows);
    source = "api-football";
    note = undefined;
    console.log(
      `→ Normalised ${teams.length} teams, ${groups.length} groups, ${matches.length} matches.`,
    );
  } else {
    console.log(
      "→ No API_FOOTBALL_KEY. Writing KEYLESS seed (venues only; teams/groups/matches empty).",
    );
  }

  const data: WCData = {
    meta: {
      league: LEAGUE,
      season: SEASON,
      source,
      generatedAt: new Date().toISOString(),
      counts: {
        teams: teams.length,
        groups: groups.length,
        matches: matches.length,
        venues: VENUES.length,
      },
      ...(note ? { note } : {}),
    },
    venues: VENUES,
    teams,
    groups,
    matches,
  };

  mkdirSync(resolve(process.cwd(), "data"), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`✓ Wrote ${OUT} (source: ${source})`);
}

main().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
