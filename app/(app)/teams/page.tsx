import { Shield } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Teams" };

export default function TeamsPage() {
  return (
    <div className="rise-in">
      <PageHeader
        kicker="48 nations · 12 groups"
        title="Teams"
        subtitle="Flags, groups and FIFA ranks for all 48 sides."
      />
      <EmptyState
        Icon={Shield}
        title="Teams load next"
        description="The teams grid and team detail pages are wired up in the data phase from the seeded dataset."
      />
    </div>
  );
}
