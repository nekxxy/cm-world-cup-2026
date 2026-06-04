// Per-user persistence via Telegram CloudStorage (Bot API 6.9+).
//
// We deliberately never touch localStorage/sessionStorage (forbidden in the
// Telegram WebView). When CloudStorage isn't available — old client, or running
// in a plain browser for development — we fall back to an in-memory map so the
// app still works within a session (it just won't persist across reloads).

const memory = new Map<string, string>();

function getStorage() {
  const wa = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  if (wa?.CloudStorage && wa.isVersionAtLeast("6.9")) return wa.CloudStorage;
  return null;
}

export function isCloudStorageAvailable(): boolean {
  return getStorage() !== null;
}

export function cloudGet(key: string): Promise<string | null> {
  const storage = getStorage();
  if (!storage) return Promise.resolve(memory.get(key) ?? null);
  return new Promise((resolve) => {
    storage.getItem(key, (err, value) => {
      if (err) resolve(null);
      else resolve(value && value.length > 0 ? value : null);
    });
  });
}

export function cloudSet(key: string, value: string): Promise<boolean> {
  memory.set(key, value); // keep the in-session copy in sync regardless
  const storage = getStorage();
  if (!storage) return Promise.resolve(false);
  return new Promise((resolve) => {
    storage.setItem(key, value, (err, ok) => resolve(!err && ok !== false));
  });
}

export function cloudRemove(key: string): Promise<boolean> {
  memory.delete(key);
  const storage = getStorage();
  if (!storage) return Promise.resolve(false);
  return new Promise((resolve) => {
    storage.removeItem(key, (err, ok) => resolve(!err && ok !== false));
  });
}
