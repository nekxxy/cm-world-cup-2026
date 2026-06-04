import { TOURNAMENT } from "@/lib/constants";

const STATS = [
  { value: TOURNAMENT.teams, label: "Teams" },
  { value: TOURNAMENT.matches, label: "Matches" },
  { value: TOURNAMENT.venues, label: "Cities" },
  { value: "1", label: "Summer" },
];

export function FanEnergySection() {
  return (
    <section className="scroll-mt-24 py-16">
      <div className="glass relative overflow-hidden rounded-3xl p-8">
        {/* Ambient nation-tinted glow (subtle, not a flag collage) */}
        <div
          className="beacon-pulse pointer-events-none absolute -left-16 -top-16 size-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(91,124,255,0.35), transparent 70%)" }}
        />
        <div
          className="beacon-pulse pointer-events-none absolute -bottom-20 right-0 size-64 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(47,191,113,0.3), transparent 70%)",
            animationDelay: "1.2s",
          }}
        />
        <div
          className="beacon-pulse pointer-events-none absolute -top-10 right-1/3 size-40 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(229,87,92,0.28), transparent 70%)",
            animationDelay: "0.6s",
          }}
        />

        <div className="relative">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Fan energy
          </p>
          <h2 className="font-display text-5xl leading-[0.9] tracking-wide text-text">
            FEEL THE
            <br />
            <span className="text-grad">ROAR</span>
          </h2>
          <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-dim">
            Floodlights up, flags high, a continent on its feet. Millions of fans,
            sixteen cities, and the kind of noise you feel in your chest — all
            night, every night (in IST).
          </p>

          <div className="mt-8 grid grid-cols-4 gap-2">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/5 px-2 py-3 text-center">
                <div className="font-display text-3xl text-text">{s.value}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-dim">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
