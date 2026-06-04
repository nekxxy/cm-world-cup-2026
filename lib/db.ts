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

      // --- Real WC2026 data (imported from the football API) ---------------
      // Every row carries source + last_updated so nothing is unattributed.
      await sql`
        CREATE TABLE IF NOT EXISTS venues (
          id           INT PRIMARY KEY,
          name         TEXT,
          city         TEXT,
          country      TEXT,
          image        TEXT,
          source       TEXT,
          last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS real_teams (
          id           INT PRIMARY KEY,
          name         TEXT NOT NULL,
          code         TEXT,
          country      TEXT,
          logo         TEXT,
          group_label  TEXT,
          source       TEXT,
          last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS real_fixtures (
          id            INT PRIMARY KEY,
          round         TEXT,
          stage         TEXT,
          home_team_id  INT,
          away_team_id  INT,
          home_name     TEXT,
          away_name     TEXT,
          home_logo     TEXT,
          away_logo     TEXT,
          venue_id      INT,
          venue_name    TEXT,
          city          TEXT,
          country       TEXT,
          kickoff       TIMESTAMPTZ,
          status_short  TEXT,
          status_long   TEXT,
          goals_home    INT,
          goals_away    INT,
          source        TEXT,
          last_updated  TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS real_players (
          id            INT PRIMARY KEY,
          name          TEXT NOT NULL,
          team_id       INT,
          position      TEXT,
          number        INT,
          age           INT,
          photo         TEXT,
          source        TEXT,
          last_updated  TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      // One row per dataset describing its freshness + provenance.
      await sql`
        CREATE TABLE IF NOT EXISTS data_sources (
          key          TEXT PRIMARY KEY,
          source       TEXT,
          status       TEXT,
          count        INT NOT NULL DEFAULT 0,
          message      TEXT,
          last_sync    TIMESTAMPTZ
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS import_logs (
          id          SERIAL PRIMARY KEY,
          kind        TEXT NOT NULL,
          status      TEXT NOT NULL,
          count       INT NOT NULL DEFAULT 0,
          message     TEXT,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      // Extra real-data columns (ESPN/WorldCupUndo shape): brand colours, IST
      // strings the source pre-computes, and per-fixture team metadata.
      await sql`ALTER TABLE real_teams ADD COLUMN IF NOT EXISTS short_name TEXT`;
      await sql`ALTER TABLE real_teams ADD COLUMN IF NOT EXISTS color TEXT`;
      await sql`ALTER TABLE real_teams ADD COLUMN IF NOT EXISTS alternate_color TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS home_short TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS away_short TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS home_color TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS away_color TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS ist_date TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS ist_time TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS ist_day_key TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS venue_country TEXT`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS is_live BOOLEAN`;
      await sql`ALTER TABLE real_fixtures ADD COLUMN IF NOT EXISTS is_finished BOOLEAN`;
    })().catch((e) => {
      schemaReady = null; // allow retry on next request
      throw e;
    });
  }
  return schemaReady;
}
