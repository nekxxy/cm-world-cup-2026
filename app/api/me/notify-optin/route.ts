import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";
import { verifyRequest } from "@/lib/telegramAuth";

export const runtime = "nodejs";

// Called by the client after Telegram's requestWriteAccess() is granted, so we
// know we're allowed to message this user.
export async function POST(req: Request) {
  const user = verifyRequest(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await ensureSchema();
    await sql`
      INSERT INTO users (id, username, first_name, photo_url, allows_write, updated_at)
      VALUES (${user.id}, ${user.username ?? null}, ${user.first_name ?? null}, ${user.photo_url ?? null}, true, now())
      ON CONFLICT (id) DO UPDATE SET allows_write = true, updated_at = now()`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
