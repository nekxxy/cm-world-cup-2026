"use client";

// Authenticated fetch to our API: attaches the raw Telegram initData header so
// the server can verify the caller. Outside Telegram, initData is empty and the
// server responds 401 — callers handle that gracefully.

export async function tgFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const initData = typeof window !== "undefined" ? window.Telegram?.WebApp?.initData ?? "" : "";
  const headers = new Headers(init.headers);
  headers.set("x-telegram-init-data", initData);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  return fetch(input, { ...init, headers });
}
