"use client";

import { useEffect, useState } from "react";
import type { TelegramThemeParams, TelegramUser, TelegramWebApp } from "./types";
import { detectAndroidPerformanceClass, type PerformanceClass } from "./performance";

export interface TelegramState {
  /** True once we've initialised against the real SDK (or decided it's absent). */
  ready: boolean;
  /** True when running inside a real Telegram WebView. */
  isTelegram: boolean;
  /** The launching user, if Telegram provided one. */
  user: TelegramUser | null;
  /** Telegram-supplied theme palette (drives our CSS variables later). */
  themeParams: TelegramThemeParams;
  colorScheme: "light" | "dark";
  /** e.g. "ios", "android", "tdesktop", "weba". */
  platform: string;
  /** Bot API version string, e.g. "8.0". */
  version: string;
  /** Advisory device grade on Android; "UNKNOWN" elsewhere. */
  performanceClass: PerformanceClass;
  /** Raw WebApp handle for advanced/feature-detected calls. */
  webApp: TelegramWebApp | null;
}

const INITIAL: TelegramState = {
  ready: false,
  isTelegram: false,
  user: null,
  themeParams: {},
  colorScheme: "light",
  platform: "unknown",
  version: "0.0",
  performanceClass: "UNKNOWN",
  webApp: null,
};

/**
 * Initialises the Telegram WebApp SDK (ready + expand) and exposes the
 * launch context. Safe to call before the SDK script has loaded — it polls
 * briefly and degrades gracefully when run outside Telegram (e.g. a browser).
 */
export function useTelegram(): TelegramState {
  const [state, setState] = useState<TelegramState>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const sync = (wa: TelegramWebApp) => {
      setState({
        ready: true,
        isTelegram: true,
        user: wa.initDataUnsafe.user ?? null,
        themeParams: wa.themeParams ?? {},
        colorScheme: wa.colorScheme ?? "light",
        platform: wa.platform ?? "unknown",
        version: wa.version ?? "0.0",
        performanceClass: detectAndroidPerformanceClass(wa.platform ?? "unknown"),
        webApp: wa,
      });
    };

    const init = () => {
      const wa = window.Telegram?.WebApp;
      if (wa) {
        // Tell Telegram we're rendered, then take the full viewport.
        wa.ready();
        wa.expand();
        sync(wa);

        // Re-sync when Telegram swaps theme (e.g. user toggles dark mode).
        const onTheme = () => sync(wa);
        wa.onEvent("themeChanged", onTheme);
        return () => wa.offEvent("themeChanged", onTheme);
      }

      // SDK script may not have executed yet — retry for ~2s, then give up
      // and report "not in Telegram" so the UI can still render.
      if (attempts < 20 && !cancelled) {
        attempts += 1;
        const id = window.setTimeout(init, 100);
        return () => window.clearTimeout(id);
      }
      if (!cancelled) setState((s) => ({ ...s, ready: true, isTelegram: false }));
      return undefined;
    };

    const cleanup = init();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return state;
}
