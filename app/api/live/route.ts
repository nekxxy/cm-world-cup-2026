import { NextResponse } from "next/server";
import { getLiveMatches } from "@/lib/data";

/**
 * Live-score layer (hybrid strategy). Only hits API-Football when USE_LIVE is
 * on AND a key is set; otherwise serves live matches from the seed. Cached so
 * we stay well under the free-tier daily cap.
 */
export const revalidate = 45;

interface LiveSummary {
  id: number;
  status: "live" | "finished" | "scheduled";
  homeScore: number | null;
  awayScore: number | null;
  minute: number | null;
}

const LIVE = new Set(["1H", "2H", "HT", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const DONE = new Set(["FT", "AET", "PEN", "AWD", "WO"]);

interface ApiLiveFixture {
  fixture: { id: number; status: { short: string; elapsed: number | null } };
  league: { id: number };
  goals: { home: number | null; away: number | null };
}

export async function GET() {
  const useLive =
    process.env.USE_LIVE === "true" && Boolean(process.env.API_FOOTBALL_KEY);

  if (!useLive) {
    const matches: LiveSummary[] = getLiveMatches().map((m) => ({
      id: m.id,
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      minute: m.minute ?? null,
    }));
    return NextResponse.json({ source: "seed", matches });
  }

  try {
    const res = await fetch("https://v3.football.api-sports.io/fixtures?live=all", {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY as string },
      next: { revalidate: 45 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = (await res.json()) as { response: ApiLiveFixture[] };
    const matches: LiveSummary[] = json.response
      .filter((f) => f.league.id === 1) // World Cup only
      .map((f) => ({
        id: f.fixture.id,
        status: LIVE.has(f.fixture.status.short)
          ? "live"
          : DONE.has(f.fixture.status.short)
            ? "finished"
            : "scheduled",
        homeScore: f.goals.home,
        awayScore: f.goals.away,
        minute: f.fixture.status.elapsed,
      }));
    return NextResponse.json({ source: "api-football", matches });
  } catch {
    // Fall back to seed on any upstream error.
    const matches: LiveSummary[] = getLiveMatches().map((m) => ({
      id: m.id,
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      minute: m.minute ?? null,
    }));
    return NextResponse.json({ source: "seed-fallback", matches });
  }
}
