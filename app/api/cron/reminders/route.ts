import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMatchesForTeam, resolveSides, getVenue } from "@/lib/data";
import { formatKickoffIST } from "@/lib/ist";
import { sendTelegramMessage } from "@/lib/telegram";
import { pushEnabled, sendPush } from "@/lib/push";

export const runtime = "nodejs";

const MIN = 60_000;

/**
 * Kickoff reminders. Fires a "30 min before" and a "kickoff" DM per favourite
 * match, once each (idempotency via the SentReminder unique constraint).
 * Protected by CRON_SECRET (Vercel Cron sends it as a Bearer token).
 *
 * SCHEDULE: the 30-min and kickoff windows below assume this runs every ~5
 * minutes. Vercel's Hobby plan only allows daily crons, so vercel.json is
 * pinned to "0 0 * * *" — at which cadence these reminders won't meaningfully
 * fire. After upgrading to Pro, restore the every-5-minutes cron in vercel.json
 * (the exact expression is in the README); the handler needs no changes.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization")?.replace("Bearer ", "");
  const query = new URL(req.url).searchParams.get("secret");
  return header === secret || query === secret;
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.BOT_TOKEN) {
    return NextResponse.json({ error: "BOT_TOKEN not set" }, { status: 503 });
  }

  const now = Date.now();
  let sent = 0;
  type SubRow = { endpoint: string; p256dh: string; auth: string };
  let users: {
    id: string;
    telegramId: string;
    favTeamId: number | null;
    fav2TeamId: number | null;
    pushSubs: SubRow[];
  }[];
  try {
    users = await prisma.user.findMany({
      where: { notifyEnabled: true },
      select: {
        id: true,
        telegramId: true,
        favTeamId: true,
        fav2TeamId: true,
        pushSubs: { select: { endpoint: true, p256dh: true, auth: true } },
      },
    });
  } catch {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }
  const canPush = pushEnabled();

  for (const u of users) {
    const favIds = [u.favTeamId, u.fav2TeamId].filter(
      (x): x is number => x != null,
    );
    const matchIds = new Set<number>();

    for (const teamId of favIds) {
      for (const m of getMatchesForTeam(teamId)) {
        if (m.status !== "scheduled" || matchIds.has(m.id)) continue;
        matchIds.add(m.id);

        const dt = Date.parse(m.kickoffUtc) - now;
        let kind: "t30" | "kickoff" | null = null;
        if (dt <= 30 * MIN && dt > 25 * MIN) kind = "t30";
        else if (dt <= 2 * MIN && dt > -3 * MIN) kind = "kickoff";
        if (!kind) continue;

        // Idempotency: skip if we already recorded this reminder.
        try {
          await prisma.sentReminder.create({
            data: { userId: u.id, matchId: m.id, kind },
          });
        } catch {
          continue; // unique violation → already sent
        }

        const { home, away } = resolveSides(m);
        const venue = getVenue(m.venueId);
        const when = formatKickoffIST(m.kickoffUtc);
        const msg =
          kind === "t30"
            ? `⏰ <b>${home.label} vs ${away.label}</b>\nKicks off in ~30 min — ${when} IST${
                venue ? `\n📍 ${venue.stadium}, ${venue.city}` : ""
              }`
            : `🔴 <b>KICKOFF</b>\n${home.label} vs ${away.label} is starting now! (${when} IST)`;

        try {
          await sendTelegramMessage(u.telegramId, msg);
          sent++;
        } catch {
          // DM failed (e.g. user blocked the bot) — the SentReminder row
          // prevents retry spam. Continue with the next reminder.
        }

        // Secondary channel: Web Push for installed-PWA users.
        if (canPush && u.pushSubs.length > 0) {
          const title =
            kind === "t30" ? "Kickoff in ~30 min" : "Kickoff now 🔴";
          const payload = {
            title,
            body: `${home.label} vs ${away.label} · ${when} IST`,
            url: `/matches/${m.id}`,
          };
          await Promise.all(
            u.pushSubs.map(async (s) => {
              try {
                const alive = await sendPush(s, payload);
                if (!alive) {
                  await prisma.pushSubscription
                    .delete({ where: { endpoint: s.endpoint } })
                    .catch(() => {});
                }
              } catch {
                /* transient push error — ignore */
              }
            }),
          );
        }
      }
    }
  }

  return NextResponse.json({ ok: true, users: users.length, sent });
}

export async function GET(req: Request) {
  return handle(req);
}
export async function POST(req: Request) {
  return handle(req);
}
