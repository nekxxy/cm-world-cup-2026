import { Flag, Trophy, Goal } from "lucide-react";
import { openingCity, finalCity } from "@/lib/cities";
import { TOURNAMENT } from "@/lib/constants";

interface Stop {
  label: string;
  detail: string;
  accent?: "gold" | "rose";
}

const STOPS: Stop[] = [
  {
    label: "Opening Match",
    detail: `${openingCity.stadium}, ${openingCity.city} · 11 Jun 2026`,
    accent: "gold",
  },
  { label: "Group Stage", detail: "48 teams · 12 groups · 72 matches" },
  { label: "Round of 32", detail: "The knockouts begin" },
  { label: "Round of 16", detail: "Win or fly home" },
  { label: "Quarter-finals", detail: "The last eight" },
  { label: "Semi-finals", detail: "One match from glory" },
  {
    label: "The Final",
    detail: `${finalCity.stadium}, ${finalCity.city} · 19 Jul 2026`,
    accent: "rose",
  },
];

export function TournamentJourneySection() {
  return (
    <section id="journey" className="scroll-mt-24 py-16">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {TOURNAMENT.matches} matches · 39 days
        </p>
        <h2 className="font-display text-4xl leading-none tracking-wide text-text">
          The tournament journey
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-dim">
          From the first whistle at the Azteca to the last in New York/New
          Jersey — the road from opening night to the final.
        </p>
      </div>

      <ol className="relative ml-3 space-y-3 border-l border-white/12 pl-6">
        {STOPS.map((s, i) => {
          const dot =
            s.accent === "gold"
              ? "bg-gold"
              : s.accent === "rose"
                ? "bg-[#ff5da2]"
                : "bg-accent/70";
          const Icon = s.accent === "gold" ? Flag : s.accent === "rose" ? Trophy : Goal;
          return (
            <li key={s.label} className="relative">
              <span
                className={`absolute -left-[31px] top-3 size-3 rounded-full ring-4 ring-bg ${dot} ${
                  s.accent ? "beacon-pulse" : ""
                }`}
              />
              <div className="glass flex items-center gap-3 rounded-2xl p-4">
                <Icon
                  className={`size-5 shrink-0 ${
                    s.accent === "rose" ? "text-[#ff5da2]" : "text-accent"
                  }`}
                />
                <div className="min-w-0">
                  <div className="font-display text-lg leading-none tracking-wide text-text">
                    {s.label}
                  </div>
                  <div className="mt-1 truncate text-sm text-dim">{s.detail}</div>
                </div>
                <span className="ml-auto font-display text-sm text-dim/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
