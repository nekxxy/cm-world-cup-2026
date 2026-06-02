import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { City } from "@/lib/cities";

/** Realistic glass card revealed when a city beacon is hovered/selected. */
export function CityInfoCard({ city }: { city: City }) {
  return (
    <div className="glass-2 w-[260px] rounded-2xl p-4 shadow-2xl">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider">
        <span
          className="size-2 rounded-full"
          style={{ background: city.nationColor }}
        />
        <span className="text-dim">{city.country}</span>
        {city.opening ? <span className="text-gold">· Opening</span> : null}
        {city.final ? <span className="text-[#ff5da2]">· Final</span> : null}
      </div>
      <h3 className="mt-1 font-display text-2xl leading-none tracking-wide text-text">
        {city.city}
      </h3>
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-dim">
        <MapPin className="size-3.5 shrink-0 text-accent" />
        {city.stadium}
      </p>
      <Link
        href={`/globe?venue=${city.id}`}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
      >
        Explore venue <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
