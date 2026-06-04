"use client";

import { useState } from "react";
import { useTelegram } from "@/telegram/useTelegram";
import { tgFetch } from "@/telegram/api";
import { hapticNotify } from "@/telegram/haptics";

// Asks Telegram for write access, then records the opt-in server-side so the
// bot can send match reminders + leaderboard nudges.
export default function NotifyButton() {
  const { webApp } = useTelegram();
  const [state, setState] = useState<"idle" | "saving" | "on" | "denied" | "unsupported">("idle");

  function enable() {
    const wa = webApp;
    if (!wa?.requestWriteAccess || !wa.isVersionAtLeast("6.9")) {
      setState("unsupported");
      return;
    }
    setState("saving");
    wa.requestWriteAccess((granted) => {
      if (!granted) {
        setState("denied");
        return;
      }
      tgFetch("/api/me/notify-optin", { method: "POST" })
        .then((r) => {
          if (r.ok) {
            hapticNotify("success");
            setState("on");
          } else {
            setState("idle");
          }
        })
        .catch(() => setState("idle"));
    });
  }

  const label =
    state === "on"
      ? "🔔 Reminders on"
      : state === "saving"
        ? "Enabling…"
        : state === "denied"
          ? "Permission denied — tap to retry"
          : state === "unsupported"
            ? "Reminders need a newer Telegram"
            : "🔔 Get match reminders";

  return (
    <button type="button" onClick={enable} disabled={state === "on" || state === "saving"} style={styles.btn}>
      {label}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btn: {
    padding: "11px 20px",
    borderRadius: 999,
    background: "transparent",
    color: "var(--color-accent)",
    border: "1px solid var(--color-accent)",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
};
