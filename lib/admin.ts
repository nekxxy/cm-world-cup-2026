import { sql } from "./db";

// Admin routes are guarded by a shared secret (server-side env). The admin page
// sends it as the x-admin-secret header.
export function isAdmin(req: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const provided = req.headers.get("x-admin-secret") ?? new URL(req.url).searchParams.get("admin_secret") ?? "";
  return provided === secret;
}

/** Map an API-Football round string to a coarse stage label. */
export function stageFromRound(round?: string): string {
  const r = (round ?? "").toLowerCase();
  if (r.includes("group")) return "group";
  if (r.includes("16")) return "R16";
  if (r.includes("quarter")) return "QF";
  if (r.includes("semi")) return "SF";
  if (r.includes("3rd") || r.includes("third")) return "3P";
  if (r.includes("final")) return "F";
  if (r.includes("32")) return "R32";
  return "other";
}

export async function recordImport(kind: string, status: string, count: number, message: string, source: string) {
  await sql`INSERT INTO import_logs (kind, status, count, message) VALUES (${kind}, ${status}, ${count}, ${message})`;
  await sql`
    INSERT INTO data_sources (key, source, status, count, message, last_sync)
    VALUES (${kind}, ${source}, ${status}, ${count}, ${message}, now())
    ON CONFLICT (key) DO UPDATE SET
      source = EXCLUDED.source, status = EXCLUDED.status, count = EXCLUDED.count,
      message = EXCLUDED.message, last_sync = now()`;
}
