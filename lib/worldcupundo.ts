// WorldCupUndo data source. Fetched server-side at runtime (Vercel can reach
// the host; our build sandbox cannot). URLs are env-overridable.
//
// The exact JSON shape isn't documented to us, so the importer maps a set of
// likely field names and skips anything it can't confidently parse — it never
// invents data. The import route returns a raw sample so the mapping can be
// verified and tightened.

const SCHEDULE_URL = process.env.WORLDCUP_SCHEDULE_URL ?? "https://worldcupundo.com/api/schedule";
const TEAMS_URL = process.env.WORLDCUP_TEAMS_URL ?? "https://worldcupundo.com/api/teams";

export const WCU_SOURCE = "worldcupundo.com";

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      // Some hosts 403 non-browser agents.
      "user-agent": "Mozilla/5.0 (compatible; WC26Fantasy/1.0)",
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

/** Normalise a response into an array — handles bare arrays and {data|matches|
 *  teams|results|response: [...]} wrappers. */
export function toArray(json: unknown): Record<string, unknown>[] {
  if (Array.isArray(json)) return json as Record<string, unknown>[];
  if (json && typeof json === "object") {
    for (const key of ["data", "matches", "fixtures", "schedule", "teams", "results", "response"]) {
      const v = (json as Record<string, unknown>)[key];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
    // Fall back to the first array-valued property.
    for (const v of Object.values(json as Record<string, unknown>)) {
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
  }
  return [];
}

export async function fetchSchedule() {
  return toArray(await fetchJson(SCHEDULE_URL));
}
export async function fetchTeams() {
  return toArray(await fetchJson(TEAMS_URL));
}

// ---- tolerant field pickers -------------------------------------------------

export function pick<T = string>(obj: Record<string, unknown>, keys: string[]): T | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

/** Pull a nested value like teams.home.name from a few likely paths. */
export function pickNested(obj: Record<string, unknown>, paths: string[][]): string | undefined {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const seg of path) {
      if (cur && typeof cur === "object") cur = (cur as Record<string, unknown>)[seg];
      else { cur = undefined; break; }
    }
    if (typeof cur === "string" && cur) return cur;
    if (typeof cur === "number") return String(cur);
  }
  return undefined;
}
