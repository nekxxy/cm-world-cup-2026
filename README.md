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
- [x] **5. Globe** — realistic R3F Earth (day/night terminator, clouds, atmosphere, bloom), 16 host pins, arcs, fly-to, device-tier gating + 2D fallback _(prioritised as the showpiece)_
- [ ] **3. Auth** — Telegram login + server verification + JWT session
- [ ] **4. Onboarding** — two-favourite flow + settings
- [ ] **6. Personalisation** — favourites hub, next-match hero, match-day theming
- [ ] **7. Live + notifications** — live layer, Telegram reminders, `.ics` export
- [ ] **8. PWA + polish** — manifest, SW, offline, Lighthouse, a11y

---

## IST everywhere

Every kickoff is stored as **UTC** and rendered in **IST (Asia/Kolkata)** via a single helper (`lib/ist.ts`). Most matches fall ~21:30–07:00 IST, so fixtures are grouped by **IST night** with friendly "Tonight / Tomorrow" framing.
