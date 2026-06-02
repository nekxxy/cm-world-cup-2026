import PageHeader from "@/components/ui/PageHeader";
import { Skeleton, MatchListSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader
        kicker="104 matches · IST"
        title="Schedule"
        subtitle="Grouped by night (Asia/Kolkata)."
      />
      <div className="no-scrollbar mb-5 flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="mb-2.5 h-6 w-28" />
      <MatchListSkeleton rows={5} />
    </div>
  );
}
