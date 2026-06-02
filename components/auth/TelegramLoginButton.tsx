"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

export default function TelegramLoginButton({
  botUsername,
}: {
  botUsername: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.onTelegramAuth = async (user: TelegramUser) => {
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Login failed");
        const next = params.get("next");
        router.push(data.needsOnboarding ? "/onboarding" : next || "/");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Login failed");
        setStatus("error");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-radius", "12");

    const node = ref.current;
    node?.appendChild(script);

    return () => {
      if (node) node.innerHTML = "";
      delete window.onTelegramAuth;
    };
  }, [botUsername, params, router]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={ref} className="flex min-h-[48px] items-center justify-center" />
      {status === "loading" ? (
        <p className="text-sm text-dim">Signing you in…</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-live">{error}</p>
      ) : null}
    </div>
  );
}
