# CLAUDE.md — project guide

WC26: a mobile-first 2026 FIFA World Cup companion. Next.js 15 (App Router) + TS strict, Tailwind v4, react-three-fiber globe, Prisma, Telegram auth, IST everywhere.

## Non-negotiable rules

1. **Never fabricate sports data.** Teams, groups, fixtures, kickoff times come ONLY from API-Football via `scripts/seed.ts` → `data/wc2026.json`. If unavailable, leave clean empty states + a `// TODO: source from API` marker. Host-city venues (`lib/venues.ts`) are the sole exception — public, verified facts.
2. **IST is the single source of truth for display.** Store kickoffs as UTC; render via the one helper in `lib/ist.ts`. Never show raw UTC to users.
3. **Mobile-first.** Verify every screen at a 390px viewport first, desktop second.
4. **Secrets** live in `.env.local` only (never commit). `.env.example` documents them. App must run keyless from the seed.

## Conventions

- Path alias `@/*` → repo root. UI primitives in `components/ui`, cards in `components/cards`, globe in `components/Globe`, nav in `components/nav`.
- Route groups: `(app)` = tabbed pages with bottom nav; `(auth)` = login/onboarding (no nav).
- Design tokens are CSS vars in `app/globals.css`, mapped to Tailwind via `@theme inline`. Accent vars (`--accent`, `--accent-2`, `--accent-rgb`) are runtime-swappable for match-day theming.
- Fonts: `font-display` (Anton) for numbers/headlines, `font-body` (Hanken Grotesk) for text. No Inter/Roboto/Arial.
- No `any` in app code. Every data view needs loading + empty + error states.

## Run

```bash
npm run dev      # http://localhost:3000
npm run build    # also typechecks + lints
npm run seed     # needs API_FOOTBALL_KEY; writes data/wc2026.json
```
