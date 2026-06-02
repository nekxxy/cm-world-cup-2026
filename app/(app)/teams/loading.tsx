import PageHeader from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <PageHeader
        kicker="48 nations · 12 groups"
        title="Teams"
        subtitle="Flags, groups and FIFA ranks for every side."
      />
      <Skeleton className="mb-3 h-11 w-full" />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
