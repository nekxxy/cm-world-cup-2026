import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyTelegramAuth,
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limit = rateLimit(`auth:${clientIp(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  const botToken = process.env.BOT_TOKEN;
  if (!botToken || !process.env.JWT_SECRET) {
    return NextResponse.json(
      { error: "Auth not configured (set BOT_TOKEN and JWT_SECRET)." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Telegram signs string values; normalise everything to strings to verify.
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (v != null) data[k] = String(v);
  }

  const tg = verifyTelegramAuth(data, botToken);
  if (!tg) {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 401 },
    );
  }

  const user = await prisma.user.upsert({
    where: { telegramId: String(tg.id) },
    update: {
      firstName: tg.first_name,
      lastName: tg.last_name ?? null,
      username: tg.username ?? null,
      photoUrl: tg.photo_url ?? null,
    },
    create: {
      telegramId: String(tg.id),
      firstName: tg.first_name,
      lastName: tg.last_name ?? null,
      username: tg.username ?? null,
      photoUrl: tg.photo_url ?? null,
    },
  });

  const token = await createSessionToken({
    uid: user.id,
    tgId: user.telegramId,
    firstName: user.firstName,
    username: user.username ?? undefined,
    photoUrl: user.photoUrl ?? undefined,
  });

  const res = NextResponse.json({
    ok: true,
    needsOnboarding: user.favTeamId == null,
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
