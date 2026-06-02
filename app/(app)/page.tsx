import { Globe2, CalendarDays, MapPin, Clock } from "lucide-react";
import BrandMark from "@/components/ui/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import Countdown from "@/components/ui/Countdown";
import { OPENING_DAY_IST_ISO, TOURNAMENT } from "@/lib/constants";

const stats = [
  { value: TOURNAMENT.teams, label: "Teams" },
  { value: TOURNAMENT.groups, label: "Groups" },
  { value: TOURNAMENT.matches, label: "Matches" },
  { value: TOURNAMENT.venues, label: "Venues" },
];

export default function HomePage() {
  return (
    <div className="rise-in">
      {/* Top bar */}
      <div className="mb-8 flex items-center justify-between">
        <BrandMark href={null} />
        <ButtonLink href="/login" variant="glass" size="sm">
          Log in
        </ButtonLink>
      </div>

      {/* Hero */}
      <section>
        <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          <span>11 Jun – 19 Jul 2026</span>
          <span className="text-dim/60">/</span>
          <span className="text-dim">USA · Canada · Mexico</span>
        </p>
        <h1 className="font-display text-[clamp(2.75rem,13vw,4.5rem)] leading-[0.86] tracking-wide">
          <span className="block text-text">FIFA WORLD</span>
          <span className="block text-grad">CUP 2026</span>
        </h1>
        <p className="mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-dim">
          A cinematic companion for the biggest World Cup ever — 48 teams across
          16 host cities. Spin a realistic 3D globe, follow your two teams, and
          catch every kickoff in{" "}
          <span className="font-semibold text-text">IST</span>.
        </p>
      </section>

      {/* Global countdown */}
      <section className="glass mt-7 rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dim">
          <Clock className="size-3.5 text-accent" />
          Opening day kicks off
          <span className="text-dim/60">·</span>
          <span className="text-accent">IST</span>
        </div>
        <Countdown target={OPENING_DAY_IST_ISO} size="lg" />
        <p className="mt-3 text-xs text-dim">
          Estadio Azteca, Mexico City — the first whistle of WC26.
        </p>
      </section>

      {/* Stats */}
      <section className="mt-4 grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass rounded-xl px-2 py-3 text-center"
          >
            <div className="font-display text-2xl text-text">{s.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* CTAs */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ButtonLink href="/globe" size="lg" className="w-full">
          <Globe2 className="size-5" />
          Spin the globe
        </ButtonLink>
        <ButtonLink href="/schedule" variant="glass" size="lg" className="w-full">
          <CalendarDays className="size-5" />
          View fixtures
        </ButtonLink>
      </section>

      <section className="mt-6 flex items-center gap-2 text-xs text-dim">
        <MapPin className="size-3.5 text-accent" />
        16 host cities · {TOURNAMENT.hosts.join(" · ")}
      </section>
    </div>
  );
}
