import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { verifyRequest, type VerifiedUser } from "@/lib/telegramAuth";
import { validateSquad } from "@/lib/rules";
import { currentRound, getRound, isLocked } from "@/lib/rounds";

export const runtime = "nodejs";

async function upsertUser(user: VerifiedUser, teamId?: string) {
  await sql`
    INSERT INTO users (id, username, first_name, photo_url, team_id, updated_at)
    VALUES (${user.id}, ${user.username ?? null}, ${user.first_name ?? null},
            ${user.photo_url ?? null}, ${teamId ?? null}, now())
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      first_name = EXCLUDED.first_name,
      photo_url = EXCLUDED.photo_url,
      team_id = COALESCE(EXCLUDED.team_id, users.team_id),
      updated_at = now()`;
}

// GET /api/picks?round=1 — current user's pick + lock state for a round.
export async function GET(req: Request) {
  const user = verifyRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const round = getRound(Number(url.searchParams.get("round"))) ?? currentRound();

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT players, captain, vice_captain, credits, locked
      FROM picks WHERE user_id = ${user.id} AND round = ${round.id}`;
    const row = rows[0];
    return NextResponse.json({
      round: round.id,
      deadline: round.deadline,
      locked: isLocked(round),
      pick: row
        ? {
            players: row.players,
            captain: row.captain,
            viceCaptain: row.vice_captain,
            credits: Number(row.credits),
            locked: row.locked,
          }
        : null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// POST /api/picks — save the user's XI for the open round.
export async function POST(req: Request) {
  const user = verifyRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { round?: number; players?: string[]; captain?: string; viceCaptain?: string; teamId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const round = getRound(Number(body.round)) ?? currentRound();
  if (isLocked(round)) {
    return NextResponse.json({ error: "locked", message: "This round is locked." }, { status: 423 });
  }

  const players = Array.isArray(body.players) ? body.players : [];
  const captain = body.captain ?? "";
  const viceCaptain = body.viceCaptain ?? "";
  const result = validateSquad({ players, captain, viceCaptain });
  if (!result.ok) {
    return NextResponse.json({ error: "invalid", errors: result.errors }, { status: 422 });
  }

  try {
    await ensureSchema();
    await upsertUser(user, body.teamId);

    // Don't overwrite a pick that's already locked.
    const existing = await sql`SELECT locked FROM picks WHERE user_id = ${user.id} AND round = ${round.id}`;
    if (existing[0]?.locked) {
      return NextResponse.json({ error: "locked" }, { status: 423 });
    }

    await sql`
      INSERT INTO picks (user_id, round, players, captain, vice_captain, credits, updated_at)
      VALUES (${user.id}, ${round.id}, ${JSON.stringify(players)}, ${captain},
              ${viceCaptain}, ${result.credits}, now())
      ON CONFLICT (user_id, round) DO UPDATE SET
        players = EXCLUDED.players,
        captain = EXCLUDED.captain,
        vice_captain = EXCLUDED.vice_captain,
        credits = EXCLUDED.credits,
        updated_at = now()`;

    return NextResponse.json({ ok: true, round: round.id, credits: result.credits });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
