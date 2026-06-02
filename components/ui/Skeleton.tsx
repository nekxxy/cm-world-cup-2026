import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

/** A few placeholder match cards for loading states. */
export function MatchCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="mb-3 flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-6 w-full" />
      </div>
      <Skeleton className="mx-auto mt-3 h-3 w-32" />
    </div>
  );
}

export function MatchListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}
