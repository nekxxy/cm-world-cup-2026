# CLAUDE.md — WC26 Fantasy (Telegram Mini App)

A mobile-first **FIFA World Cup 2026 fantasy game**, built as a **Telegram Mini App**
that runs inside Telegram's in-app WebView and is launched by a BotFather bot.
Deployed on Vercel; the deployment URL is wired into BotFather.

Stack: Next.js (App Router) + TypeScript, `@react-three/fiber`, `@react-three/drei`,
`three`, `gsap`, and the Telegram WebApp SDK. Audience: primarily Indian mobile
users inside Telegram.

## Hard rules — follow throughout

1. **Three.js / R3F is client-only.** Every WebGL component is `'use client'` and
   loaded via `dynamic(import, { ssr: false })`. **Never** server-render a `<Canvas>`.
2. **No web storage.** This runs in Telegram's WebView — never use `localStorage`
   or `sessionStorage`. Use **Telegram CloudStorage** for per-user data and the
   backend DB (added later) for shared data.
3. **Mobile-first.** Verify every screen at a 390px viewport first.
4. **R3F performance budget.** Cap `dpr={[1, 1.5]}`, show a poster image before
   WebGL hydrates, lazy-load scenes, and auto-downgrade to a flat hero on weak
   devices using the Telegram **Android performance class**.
5. **Feature-detect before new APIs.** Check `WebApp.version` (`isVersionAtLeast`)
   before fullscreen / gyroscope / device-info calls (Bot API 8.0+). Degrade
   gracefully on older clients.
6. **Respect the device.** Honour `prefers-reduced-motion` and safe-area insets.
   **Damp all sensor input** — never apply raw gyroscope/accelerometer values.
7. **Theme.** Retro screen-print / risograph poster aesthetic. The whole UI
   re-themes to the user's selected national team via CSS variables.

## Folder structure

- `telegram/` — SDK init + hooks (`useTelegram`, performance class, types).
- `theme/` — per-team theming (CSS variable maps). *(scaffold)*
- `scenes/` — R3F scenes, all client-only. *(scaffold)*
- `app/` — screens / routes (App Router).
- `data/` — teams, fixtures. *(scaffold)*

Path alias: `@/*` → repo root.

## Status

**Phase 1 (current): SDK + identity proof.** Telegram SDK initialised
(`ready()`, `expand()`); `useTelegram()` exposes user, theme params, platform,
and Android performance class; a single screen renders "Hello {firstName}" with
the avatar. **No game, theming, or 3D yet** — pending confirmation that real
Telegram data loads on iOS and Android.

## Run

```bash
npm run dev     # http://localhost:3000 (open via the bot for real Telegram data)
npm run build   # typechecks + builds
```
