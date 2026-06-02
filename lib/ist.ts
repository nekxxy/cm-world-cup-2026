import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { IST_TZ } from "./constants";

/**
 * The single source of truth for time display. Every kickoff is stored as UTC
 * and rendered here in IST (Asia/Kolkata). Never show raw UTC to the user.
 */

const D = (utc: string | number | Date) => new Date(utc);

/** Spec's canonical formatter: "Thu, 11 Jun, 21:30". */
export const toIST = (utc: string | number | Date) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(D(utc));

/** "21:30" — 24h kickoff time in IST. */
export const istTime = (utc: string | number | Date) =>
  formatInTimeZone(D(utc), IST_TZ, "HH:mm");

/** "Thu" */
export const istWeekday = (utc: string | number | Date) =>
  formatInTimeZone(D(utc), IST_TZ, "EEE");

/** "11 Jun" */
export const istDayMonth = (utc: string | number | Date) =>
  formatInTimeZone(D(utc), IST_TZ, "d MMM");

/** "Thu 11 Jun · 21:30" — full kickoff label. */
export const formatKickoffIST = (utc: string | number | Date) =>
  formatInTimeZone(D(utc), IST_TZ, "EEE d MMM · HH:mm");

/** Sortable IST calendar-day key, e.g. "2026-06-11". */
export const istDayKey = (utc: string | number | Date) =>
  formatInTimeZone(D(utc), IST_TZ, "yyyy-MM-dd");

/** Today's IST day key. */
export const istTodayKey = () => istDayKey(new Date());

/** Hour of day (0–23) in IST. */
export const istHour = (utc: string | number | Date) =>
  toZonedTime(D(utc), IST_TZ).getHours();

/** Most WC matches fall ~21:30–07:00 IST — a late-night watch. */
export const isLateNightIST = (utc: string | number | Date) => {
  const h = istHour(utc);
  return h >= 21 || h < 7;
};

const dayDiff = (key: string, todayKey: string) => {
  // Keys are yyyy-MM-dd; parse as UTC midnights so the diff is whole days.
  const a = Date.parse(`${key}T00:00:00Z`);
  const b = Date.parse(`${todayKey}T00:00:00Z`);
  return Math.round((a - b) / 86_400_000);
};

/** Neutral relative label for an IST day key. */
export function dayLabel(key: string, todayKey = istTodayKey()): string {
  const d = dayDiff(key, todayKey);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  const [, m, day] = key.split("-");
  const date = new Date(Date.UTC(2026, Number(m) - 1, Number(day)));
  const wd = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
  const dm = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
  return `${wd} ${dm}`;
}

/** Late-night-flavoured heading used by the schedule. */
export function nightHeading(key: string, todayKey = istTodayKey()): string {
  const d = dayDiff(key, todayKey);
  if (d === 0) return "Tonight";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Last night";
  return dayLabel(key, todayKey);
}

export interface ISTDayGroup<T> {
  key: string;
  heading: string;
  dateLabel: string;
  items: T[];
}

/**
 * Group items (typically matches) by IST calendar day, chronologically.
 * Returns ordered groups with friendly headings.
 */
export function groupByISTDay<T>(
  items: T[],
  getUtc: (item: T) => string,
  todayKey = istTodayKey(),
): ISTDayGroup<T>[] {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const key = istDayKey(getUtc(item));
    const list = buckets.get(key);
    if (list) list.push(item);
    else buckets.set(key, [item]);
  }

  return [...buckets.keys()]
    .sort()
    .map((key) => {
      const dayItems = buckets
        .get(key)!
        .slice()
        .sort((a, b) => Date.parse(getUtc(a)) - Date.parse(getUtc(b)));
      const [, m, day] = key.split("-");
      const date = new Date(Date.UTC(2026, Number(m) - 1, Number(day)));
      return {
        key,
        heading: nightHeading(key, todayKey),
        dateLabel: new Intl.DateTimeFormat("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }).format(date),
        items: dayItems,
      };
    });
}
