import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { broadcast, botConfigured } from "@/lib/bot";

export const runtime = "nodejs";

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") ?? req.headers.get("x-cron-secret") ?? "";
  return provided === secret;
}

// Sends a "leaderboard updated" nudge after results are entered. Idempotent per
// round (claims `leaderboard-<round>`), so the scoring step can call it freely.
export async function POST(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!botConfigured()) return NextResponse.json({ error: "bot_not_configured" }, { status: 500 });

  const url = new URL(req.url);
  const round = Number(url.searchParams.get("round") ?? "0");
  if (!round) return NextResponse.json({ error: "round_required" }, { status: 400 });

  try {
    await ensureSchema();
    const claim = await sql`
      INSERT INTO notifications_sent (fixture_id, kind)
      VALUES (${`round-${round}`}, 'leaderboard')
      ON CONFLICT (fixture_id, kind) DO NOTHING
      RETURNING fixture_id`;
    if (claim.length === 0) {
      return NextResponse.json({ ok: true, alreadySent: true });
    }

    const recipients = (await sql`SELECT id FROM users WHERE allows_write = true`).map((r) => Number(r.id));
    const sent = await broadcast(recipients, () => ({
      text: `📊 <b>The leaderboard just updated</b> for Matchday ${round}.\nSee where you and your friends landed.`,
      startParam: "leaderboard",
      buttonText: "View leaderboard",
    }));
    return NextResponse.json({ ok: true, recipients: recipients.length, sent });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
