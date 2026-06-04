// Minimal, hand-written typings for the parts of the Telegram WebApp SDK we use.
// The official SDK is injected at runtime by Telegram via the
// `telegram-web-app.js` script; there is no npm package that ships these types
// in a form we control, so we narrow to exactly what this app touches.

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

export interface TelegramCloudStorage {
  setItem: (key: string, value: string, cb?: (err: string | null, ok?: boolean) => void) => void;
  getItem: (key: string, cb: (err: string | null, value?: string) => void) => void;
  removeItem: (key: string, cb?: (err: string | null, ok?: boolean) => void) => void;
  getKeys: (cb: (err: string | null, keys?: string[]) => void) => void;
}

export type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type HapticNotificationType = "error" | "success" | "warning";

export interface TelegramHapticFeedback {
  impactOccurred: (style: HapticImpactStyle) => void;
  notificationOccurred: (type: HapticNotificationType) => void;
  selectionChanged: () => void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    auth_date?: number;
    hash?: string;
    [key: string]: unknown;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;

  CloudStorage?: TelegramCloudStorage;
  HapticFeedback?: TelegramHapticFeedback;

  ready: () => void;
  expand: () => void;
  isVersionAtLeast: (version: string) => boolean;
  onEvent: (eventType: string, handler: () => void) => void;
  offEvent: (eventType: string, handler: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}
