import Link from "next/link";
import { Trophy, ArrowRight, CalendarDays } from "lucide-react";
import { finalCity } from "@/lib/cities";

export function FinalDestinationSection() {
  return (
    <section className="scroll-mt-24 pb-8 pt-16">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 p-8"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(233,178,76,0.16), transparent 55%), linear-gradient(180deg, #0c1018, #070a12)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/30">
            <Trophy className="size-7" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            Final destination · 19 Jul 2026
          </p>
          <h2 className="mt-2 font-display text-5xl leading-[0.88] tracking-wide text-text">
            THE FINAL
          </h2>
          <p className="mt-3 text-base text-text">{finalCity.stadium}</p>
          <p className="text-sm text-dim">
            {finalCity.city}, {finalCity.country}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href={`/globe?venue=${finalCity.id}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-bg accent-glow transition hover:brightness-110"
            >
              Explore the venue <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/schedule"
              className="glass-2 inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-text"
            >
              <CalendarDays className="size-4 text-accent" />
              View fixtures
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-dim">
        The Road to 2026 · Sixteen cities · Three nations · One summer of football
      </p>
    </section>
  );
}
