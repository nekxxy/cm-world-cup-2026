"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export default function NotifyToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next);
    setSaving(true);
    try {
      const res = await fetch("/api/me/favourites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notifyEnabled: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setOn(!next); // revert on failure
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label="Kickoff reminders"
      disabled={saving}
      onClick={toggle}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        on ? "bg-accent" : "bg-white/15",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
