import webpush from "web-push";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@wc26.app",
    publicKey,
    privateKey,
  );
  configured = true;
  return true;
}

export function pushEnabled(): boolean {
  return ensureConfigured();
}

export interface StoredSub {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** Send a Web Push notification. Resolves false if the sub is gone (410/404). */
export async function sendPush(
  sub: StoredSub,
  payload: PushPayload,
): Promise<boolean> {
  if (!ensureConfigured()) throw new Error("VAPID not configured");
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return true;
  } catch (err) {
    const code = (err as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) return false; // expired subscription
    throw err;
  }
}
