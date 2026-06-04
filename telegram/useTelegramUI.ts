"use client";

import { useEffect } from "react";

function webApp() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
}

/**
 * Shows Telegram's native BackButton while `visible` and routes its tap to
 * `onClick`. Hides + cleans up on unmount. No-op outside Telegram.
 */
export function useBackButton(visible: boolean, onClick: () => void) {
  useEffect(() => {
    const bb = webApp()?.BackButton;
    if (!bb) return;
    if (visible) {
      bb.onClick(onClick);
      bb.show();
      return () => {
        bb.offClick(onClick);
        bb.hide();
      };
    }
    bb.hide();
    return undefined;
  }, [visible, onClick]);
}

interface MainButtonOpts {
  text: string;
  visible: boolean;
  active?: boolean;
  progress?: boolean;
  onClick: () => void;
}

/**
 * Drives Telegram's native MainButton (the big bottom CTA) for primary actions
 * like Save XI / Claim Reward. Colours follow the current theme. No-op outside
 * Telegram so callers can render their own button as a fallback.
 */
export function useMainButton({ text, visible, active = true, progress = false, onClick }: MainButtonOpts) {
  useEffect(() => {
    const mb = webApp()?.MainButton;
    if (!mb) return;
    mb.setText(text);
    if (active) mb.enable();
    else mb.disable();
    if (progress) mb.showProgress();
    else mb.hideProgress();
    if (visible) mb.show();
    else mb.hide();
    mb.onClick(onClick);
    return () => {
      mb.offClick(onClick);
      mb.hide();
      mb.hideProgress();
    };
  }, [text, visible, active, progress, onClick]);
}

export function isMainButtonAvailable(): boolean {
  return Boolean(webApp()?.MainButton);
}
