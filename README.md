# WC26 Fantasy — Telegram Mini App

A mobile-first **FIFA World Cup 2026 fantasy game** that runs inside Telegram as a
Mini App. Launch it from your BotFather bot; it's deployed on Vercel.

> See [`CLAUDE.md`](./CLAUDE.md) for the full engineering rules. The short version:
> R3F is client-only, no `localStorage`/`sessionStorage` (use Telegram CloudStorage),
> mobile-first, feature-detect `WebApp.version`, respect reduced-motion + safe areas,
> and theme to the user's national team via CSS variables.

## Phase 1 (current)

Proves real Telegram data flows end to end:

- Initialises the Telegram WebApp SDK (`ready()`, `expand()`).
- `useTelegram()` hook exposes `user` (name, username, photo), theme params,
  platform, Bot API version, and the Android performance class.
- A single screen renders **"Hello {firstName}"** with the user's avatar.

No game, theming, or 3D yet — that comes after confirming data loads on iOS and
Android inside Telegram.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

Opened in a plain browser it shows an "open me inside Telegram" message — that's
expected, since there's no `window.Telegram.WebApp` outside the WebView.

## Deploy & wire up

1. Deploy to Vercel (this repo builds with zero env vars).
2. In **BotFather**: `/newapp` (or Bot Settings → Menu Button / Mini App) and
   paste the Vercel URL.
3. Open the bot in Telegram on iOS and Android and confirm your name + avatar show.

## Project layout

```
telegram/   SDK init + hooks (useTelegram, performance class, types)
theme/      per-team theming           (scaffold)
scenes/     R3F scenes, client-only     (scaffold)
app/        screens / routes
data/       teams, fixtures             (scaffold)
```
