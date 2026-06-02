/* WC26 service worker — offline app shell, asset caching, and Web Push. */
const VERSION = "wc26-v1";
const CORE = `${VERSION}-core`;
const RUNTIME = `${VERSION}-runtime`;
const TEXTURES = `${VERSION}-textures`;

const CORE_URLS = ["/", "/schedule", "/teams", "/globe", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE)
      .then((cache) =>
        Promise.allSettled(CORE_URLS.map((u) => cache.add(u))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function cacheFirst(req, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        }),
    ),
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Globe textures (cross-origin CDN) → cache-first so the globe works offline.
  if (url.hostname === "cdn.jsdelivr.net") {
    event.respondWith(cacheFirst(request, TEXTURES));
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Never cache API/auth.
  if (url.pathname.startsWith("/api/")) return;

  // Static assets & icons → cache-first.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/favicon.ico"
  ) {
    event.respondWith(cacheFirst(request, RUNTIME));
    return;
  }

  // Navigations → network-first, fall back to cache, then the cached shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match("/")),
        ),
    );
  }
});

/* ── Web Push ─────────────────────────────────────────────── */
self.addEventListener("push", (event) => {
  let data = { title: "WC26", body: "Kickoff reminder", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* keep defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url || "/" },
      vibrate: [80, 40, 80],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const c of clients) {
          if ("focus" in c) {
            c.navigate(target);
            return c.focus();
          }
        }
        return self.clients.openWindow(target);
      }),
  );
});
