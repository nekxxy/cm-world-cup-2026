# WC26 — 2026 FIFA World Cup Companion 🌎⚽

A **mobile-first** companion web app for the **2026 FIFA World Cup** (USA · Canada · Mexico, 11 Jun – 19 Jul 2026 · 48 teams · 12 groups · 104 matches · 16 venues).

The hero is a **realistic, interactive 3D globe** of all 16 host cities. Log in with **Telegram**, pick a **favourite** and **second-favourite** team, and get a personalised hub: your teams' fixtures first, every kickoff in **IST (Asia/Kolkata)**, live scores, countdowns, and **kickoff reminders via Telegram**.

> **Cinematic "space + broadcast" aesthetic** — deep space-black, a realistic Earth, and an electric accent that retints to your favourite team on match days.

---

## Tech stack

| Area      | Choice |
|-----------|--------|
| Framework | Next.js 15 (App Router) + TypeScript (strict) |
| Styling   | Tailwind CSS v4 (CSS-first `@theme`) |
| 3D        | react-three-fiber · @react-three/drei · @react-three/postprocessing |
| State     | Zustand |
| Data ORM  | Prisma (SQLite in dev · Postgres in prod) |
| Dates     | date-fns · date-fns-tz (UTC → IST) |
| Auth      | Telegram Login Widget (server-verified) + JWT session cookie |
| Notify    | Telegram Bot API DMs · Web Push (VAPID) |
| Fonts     | Anton (display) · Hanken Grotesk (body) |
| Deploy    | Vercel |

---

## Quick start (keyless)

The app runs **fully from the committed seed** (`data/wc2026.json`) — no API key or secrets required to browse the globe, schedule, and teams.

```bash
npm install
cp .env.example .env.local   # optional — all keys can stay blank
npm run dev                  # http://localhost:3000
```

> ℹ️ **Data integrity:** This project never fabricates sports data. Teams, groups, fixtures, and kickoff times come only from API-Football (see below). Host-city venues are the one exception — they're public, verified facts and are seeded directly. Until you run the seed with a real key, fixture/team views show clean empty states.

---

## Full setup

### 1. Sports data — API-Football (api-sports.io)

```bash
# In .env.local
API_FOOTBALL_KEY="your-key"   # free tier ≈ 100 req/day

npm run seed                  # fetches teams + standings + fixtures ONCE,
                              # normalises, writes data/wc2026.json (committed)
```

The seed calls the API **once** at build time. The runtime live-score layer (`/api/live`) only polls during live match windows and is cached aggressively. Set `USE_LIVE="false"` to disable it entirely.

### 2. Auth — Telegram

1. Create a bot with [@BotFather](https://t.me/BotFather); copy the **token** and **username**.
2. `/setdomain` → your deployed domain (the login widget won't load otherwise; `localhost` needs a tunnel such as ngrok/cloudflared).
3. Set `NEXT_PUBLIC_BOT_USERNAME`, `BOT_TOKEN`, and `JWT_SECRET` (`openssl rand -hex 32`).

### 3. Notifications — Web Push (optional)

```bash
npx web-push generate-vapid-keys
# → NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY
```

See [`.env.example`](./.env.example) for the full list.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run seed` | Fetch real WC2026 data → `data/wc2026.json` |

---

## Build phases

This is built in the verifiable phases from the spec:

- [x] **1. Scaffold** — Next 15 + TS + Tailwind v4, design system, bottom nav, dark theme, fonts
- [x] **2. Data** — Prisma schema, seed, IST helper, 2D schedule/teams/match pages
- [x] **3. Auth** — Telegram login + server verification + JWT session + middleware
- [x] **4. Onboarding** — two-favourite flow + settings edit
- [x] **5. Globe** — realistic R3F Earth (day/night terminator, clouds, atmosphere, bloom), 16 host pins, arcs, fly-to, device-tier gating + 2D fallback _(the showpiece)_
- [x] **6. Personalisation** — favourites hub, next-match hero, match-day theming, globe focus
- [x] **7. Live + notifications** — cached live layer, Telegram reminders cron, Web Push, `.ics` export
- [x] **8. PWA + polish** — manifest, icons, service worker (offline + push), OG image

> Verified locally via `tsc` + `next build` + route smoke tests + unit checks (IST, ICS).
> The WebGL globe render and Lighthouse scores need a real browser/deploy (this
> build env has no GPU and blocks the texture CDN). Seeded team/fixture views and
> Telegram/Push flows need their respective keys to light up (keyless-safe).

## Production (Vercel)

1. **Database** — set `DATABASE_URL` to Postgres and change `prisma/schema.prisma` `datasource` provider to `postgresql`, then `prisma migrate deploy` (or `prisma db push`).
2. **Seed** — run `npm run seed` with `API_FOOTBALL_KEY` and commit the refreshed `data/wc2026.json`.
3. **Telegram** — `BOT_TOKEN`, `NEXT_PUBLIC_BOT_USERNAME`, `JWT_SECRET`; `/setdomain` to the deployed URL.
4. **Reminders cron** — `vercel.json` runs `/api/cron/reminders`; set `CRON_SECRET` (Vercel sends it as a Bearer token).
   - **Hobby plan** only allows **daily** crons, so the schedule is pinned to `0 0 * * *`. The reminder windows (30-min/kickoff) need a frequent cron to fire, so on **Pro** restore the intended **every-5-minutes** schedule `*/5 * * * *` in `vercel.json`.
5. **Web Push** — set the VAPID keys. `USE_LIVE=true` enables the live-score layer.

---

## IST everywhere

Every kickoff is stored as **UTC** and rendered in **IST (Asia/Kolkata)** via a single helper (`lib/ist.ts`). Most matches fall ~21:30–07:00 IST, so fixtures are grouped by **IST night** with friendly "Tonight / Tomorrow" framing.
