import { neon } from "@neondatabase/serverless";

// Neon serverless (HTTP) client — ideal for Vercel's serverless functions.
// DATABASE_URL is provided by the Neon integration / Vercel env.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Don't throw at import time during build; routes surface a clear 500 instead.
  console.warn("DATABASE_URL is not set — database routes will fail until it is.");
}

// A syntactically valid placeholder keeps neon() from throwing at build/import
// time when DATABASE_URL is absent; a real connection only opens on query.
export const sql = neon(connectionString ?? "postgresql://user:pass@localhost/db");

// Run the schema once per warm runtime. CREATE TABLE IF NOT EXISTS is idempotent
// so concurrent cold starts are safe.
let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id           BIGINT PRIMARY KEY,
          username     TEXT,
          first_name   TEXT,
          photo_url    TEXT,
          team_id      TEXT,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS picks (
          user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          round         INT NOT NULL,
          players       JSONB NOT NULL,
          captain       TEXT NOT NULL,
          vice_captain  TEXT NOT NULL,
          credits       NUMERIC(5,1) NOT NULL,
          locked        BOOLEAN NOT NULL DEFAULT false,
          updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (user_id, round)
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS results (
          id          SERIAL PRIMARY KEY,
          round       INT NOT NULL,
          payload     JSONB NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS scores (
          user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          round      INT NOT NULL,
          points     INT NOT NULL DEFAULT 0,
          total      INT NOT NULL DEFAULT 0,
          rank       INT,
          prev_rank  INT,
          PRIMARY KEY (user_id, round)
        )`;
      // Whether the user granted the bot write access (for reminders).
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS allows_write BOOLEAN NOT NULL DEFAULT false`;
      // Idempotency ledger: one row per (fixture/event, kind) we've notified for.
      await sql`
        CREATE TABLE IF NOT EXISTS notifications_sent (
          fixture_id  TEXT NOT NULL,
          kind        TEXT NOT NULL,
          sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (fixture_id, kind)
        )`;
    })().catch((e) => {
      schemaReady = null; // allow retry on next request
      throw e;
    });
  }
  return schemaReady;
}
