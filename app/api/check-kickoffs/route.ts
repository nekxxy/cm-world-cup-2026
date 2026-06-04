import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { broadcast, botConfigured } from "@/lib/bot";
import { SCHEDULE, type ScheduleMatch } from "@/data/schedule";
import { getTeam } from "@/data/teams";
import { formatIST } from "@/lib/ist";

export const runtime = "nodejs";

const LEAD_MINUTES = 45; // notify when kickoff is within this window

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // must be configured
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") ?? req.headers.get("x-cron-secret") ?? "";
  return provided === secret;
}

function matchLabel(m: ScheduleMatch): string {
  if (m.homeId && m.awayId) {
    const h = getTeam(m.homeId)?.name ?? m.homeId;
    const a = getTeam(m.awayId)?.name ?? m.awayId;
    return `${h} vs ${a}`;
  }
  return m.label ?? "Knockout match";
}

// Idempotent: claims each fixture via INSERT ... ON CONFLICT DO NOTHING before
// sending, so repeated calls (every few minutes from an external scheduler)
// never double-send. Safe to hit as often as you like.
async function run(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!botConfigured()) return NextResponse.json({ error: "bot_not_configured" }, { status: 500 });

  const url = new URL(req.url);
  const dry = url.searchParams.get("dry") === "1";
  const forceId = url.searchParams.get("fixtureId"); // testing: target one fixture

  try {
    await ensureSchema();
    const now = Date.now();
    const horizon = now + LEAD_MINUTES * 60 * 1000;

    const due = SCHEDULE.filter((m) => {
      if (forceId) return m.id === forceId;
      const t = new Date(m.kickoff).getTime();
      return t > now && t <= horizon;
    });

    if (dry) {
      return NextResponse.json({ now: new Date(now).toISOString(), due: due.map((m) => m.id) });
    }

    const recipients = (await sql`SELECT id FROM users WHERE allows_write = true`).map((r) => Number(r.id));

    const claimed: string[] = [];
    let totalSent = 0;
    for (const m of due) {
      // Claim this fixture's "kickoff" notification atomically.
      const rows = await sql`
        INSERT INTO notifications_sent (fixture_id, kind)
        VALUES (${m.id}, 'kickoff')
        ON CONFLICT (fixture_id, kind) DO NOTHING
        RETURNING fixture_id`;
      if (rows.length === 0) continue; // already sent — skip
      claimed.push(m.id);

      if (recipients.length === 0) continue;
      const label = matchLabel(m);
      const when = formatIST(m.kickoff);
      totalSent += await broadcast(recipients, () => ({
        text: `⚽ <b>${label}</b> kicks off soon\n${when}\n\nLock in or check your XI before the whistle.`,
        startParam: `match_${m.id}`,
        buttonText: "Open my team",
      }));
    }

    return NextResponse.json({ ok: true, recipients: recipients.length, claimed, sent: totalSent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return run(req);
}
export async function POST(req: Request) {
  return run(req);
}
