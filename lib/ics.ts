import type { Match, Team } from "./types";
import { getVenue, resolveSides } from "./data";
import { STAGE_LABELS } from "./stages";
import { formatKickoffIST } from "./ist";

/** Compact UTC stamp: 20260611T193000Z */
function ics(dt: Date): string {
  return dt.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape ICS TEXT values (RFC 5545). */
function esc(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Fold lines to <=75 octets per RFC 5545 (continuation lines start w/ space). */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let rest = line;
  out.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    out.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) out.push(" " + rest);
  return out.join("\r\n");
}

/** Build a VCALENDAR for a team's matches — IST in the description, +30m alarm. */
export function buildTeamIcs(team: Team, matches: Match[]): string {
  const now = ics(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WC26//World Cup 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    fold(`X-WR-CALNAME:WC26 — ${esc(team.name)}`),
  ];

  for (const m of matches) {
    const { home, away } = resolveSides(m);
    const venue = getVenue(m.venueId);
    const start = new Date(m.kickoffUtc);
    const end = new Date(start.getTime() + 120 * 60_000);
    const stage =
      m.stage === "group" && m.groupId
        ? `Group ${m.groupId}`
        : STAGE_LABELS[m.stage];
    const title = `${home.label} vs ${away.label} — ${stage}`;
    const loc = venue
      ? `${venue.stadium}, ${venue.city}, ${venue.country}`
      : "Venue TBD";

    lines.push(
      "BEGIN:VEVENT",
      `UID:wc26-${m.id}@wc26.app`,
      `DTSTAMP:${now}`,
      `DTSTART:${ics(start)}`,
      `DTEND:${ics(end)}`,
      fold(`SUMMARY:${esc(title)}`),
      fold(`LOCATION:${esc(loc)}`),
      fold(
        `DESCRIPTION:${esc(`Kickoff ${formatKickoffIST(m.kickoffUtc)} IST · ${stage}`)}`,
      ),
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      fold(`DESCRIPTION:${esc(`${home.label} vs ${away.label} in 30 min`)}`),
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
