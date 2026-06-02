import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Friendly empty / not-yet-available state used across data views. */
export default function EmptyState({
  Icon,
  title,
  description,
  action,
  className,
}: {
  Icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center rounded-2xl px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-surface2 text-accent">
        <Icon className="size-7" strokeWidth={1.8} />
      </span>
      <h2 className="mt-4 font-display text-xl tracking-wide text-text">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-xs text-sm text-dim">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
