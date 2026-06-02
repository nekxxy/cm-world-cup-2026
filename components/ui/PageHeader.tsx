import { cn } from "@/lib/cn";

/** Consistent screen header: kicker + big display title + optional action. */
export default function PageHeader({
  kicker,
  title,
  subtitle,
  action,
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-5 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {kicker ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {kicker}
          </p>
        ) : null}
        <h1 className="font-display text-3xl leading-[0.95] tracking-wide text-text">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1.5 text-sm text-dim">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
