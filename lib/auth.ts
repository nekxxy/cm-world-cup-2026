import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_COOKIE } from "./sessionCookie";

export { SESSION_COOKIE };

/**
 * Telegram Login auth + JWT session.
 * Verification follows the Telegram spec: secret = SHA256(BOT_TOKEN), the
 * data-check-string is every field except `hash` as `key=value` sorted by key
 * and joined by "\n", and HMAC_SHA256(dataCheckString, secret) must equal hash.
 */

const MAX_AUTH_AGE_S = 86_400; // reject auth payloads older than ~1 day
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

export interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface SessionUser {
  uid: string; // our DB user id
  tgId: string;
  firstName: string;
  username?: string;
  photoUrl?: string;
}

function secretKey(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

/** Verify the Telegram Login Widget payload server-side. */
export function verifyTelegramAuth(
  data: Record<string, string>,
  botToken: string,
): TelegramAuthData | null {
  const { hash, ...rest } = data;
  if (!hash) return null;

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");

  const secret = createHash("sha256").update(botToken).digest();
  const computed = createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  // Constant-time compare.
  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const authDate = Number(rest.auth_date);
  if (!Number.isFinite(authDate)) return null;
  if (Date.now() / 1000 - authDate > MAX_AUTH_AGE_S) return null;

  return {
    id: Number(rest.id),
    first_name: rest.first_name ?? "",
    last_name: rest.last_name,
    username: rest.username,
    photo_url: rest.photo_url,
    auth_date: authDate,
    hash,
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_S}s`)
    .sign(secretKey());
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_S,
};

/** Read + verify the session from the request cookie (server only). */
export async function getSession(): Promise<SessionUser | null> {
  if (!process.env.JWT_SECRET) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { uid, tgId, firstName, username, photoUrl } = payload as Record<
      string,
      unknown
    >;
    if (typeof uid !== "string" || typeof tgId !== "string") return null;
    return {
      uid,
      tgId,
      firstName: String(firstName ?? ""),
      username: typeof username === "string" ? username : undefined,
      photoUrl: typeof photoUrl === "string" ? photoUrl : undefined,
    };
  } catch {
    return null;
  }
}
