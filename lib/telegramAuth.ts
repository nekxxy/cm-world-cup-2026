import crypto from "node:crypto";

// Server-side validation of Telegram WebApp initData.
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
//
// The client sends the raw initData string (a URL-encoded query) which we
// verify with the bot token before trusting ANY field. Never trust user id /
// name from the client without this check.

const MAX_AGE_SECONDS = 60 * 60 * 24; // reject stale initData (> 24h)

export interface VerifiedUser {
  id: number;
  username?: string;
  first_name?: string;
  photo_url?: string;
}

export function verifyInitData(initData: string): VerifiedUser | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !initData) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  // Build the data-check-string: all fields except `hash`, sorted, joined by \n.
  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key !== "hash") pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join("\n");

  // secret = HMAC_SHA256(bot_token) keyed by the literal "WebAppData".
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  // Constant-time comparison.
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Freshness check.
  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > MAX_AGE_SECONDS) return null;

  // Parsed, trusted user.
  try {
    const user = JSON.parse(params.get("user") ?? "null");
    if (!user || typeof user.id !== "number") return null;
    return {
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      photo_url: user.photo_url,
    };
  } catch {
    return null;
  }
}

/** Pull initData from a request header and verify it. */
export function verifyRequest(req: Request): VerifiedUser | null {
  const header =
    req.headers.get("x-telegram-init-data") ??
    req.headers.get("authorization")?.replace(/^tma\s+/i, "") ??
    "";
  return verifyInitData(header);
}
