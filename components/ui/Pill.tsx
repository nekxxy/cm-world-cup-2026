import { cn } from "@/lib/cn";

type Tone = "default" | "accent" | "live" | "gold" | "muted";

const tones: Record<Tone, string> = {
  default: "bg-surface2 text-text ring-1 ring-white/10",
  accent: "bg-accent/15 text-accent ring-1 ring-accent/30",
  live: "bg-live/15 text-live ring-1 ring-live/30",
  gold: "bg-gold/15 text-gold ring-1 ring-gold/30",
  muted: "bg-surface text-dim ring-1 ring-white/5",
};

export default function Pill({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
