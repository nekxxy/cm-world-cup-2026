import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { CITIES } from "@/lib/cities";

export function HostCitiesSection() {
  return (
    <section id="host-cities" className="scroll-mt-24 py-16">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          16 host cities · 3 nations
        </p>
        <h2 className="font-display text-4xl leading-none tracking-wide text-text">
          Where it all happens
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-dim">
          From Vancouver&apos;s harbour to the heat of Monterrey — every stop on
          the road, grounded in a real city and stadium.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CITIES.map((c) => (
          <Link
            key={c.id}
            href={`/globe?venue=${c.id}`}
            className="group glass relative overflow-hidden rounded-2xl p-4 transition hover:border-white/20"
          >
            <span
              className="absolute inset-y-0 left-0 w-1"
              style={{ background: c.nationColor }}
            />
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dim">
                  {c.country}
                  {c.opening ? <span className="text-gold">· Opening</span> : null}
                  {c.final ? <span className="text-[#ff5da2]">· Final</span> : null}
                </div>
                <h3 className="mt-0.5 font-display text-2xl leading-none tracking-wide text-text">
                  {c.city}
                </h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-dim">
                  <MapPin className="size-3.5 shrink-0 text-accent" />
                  {c.stadium}
                </p>
              </div>
              <ArrowUpRight className="size-5 shrink-0 text-dim transition group-hover:text-accent" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
