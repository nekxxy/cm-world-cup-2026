import { CalendarDays } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <div className="rise-in">
      <PageHeader
        kicker="104 matches · IST"
        title="Schedule"
        subtitle="Every fixture, grouped by night (Asia/Kolkata)."
      />
      <EmptyState
        Icon={CalendarDays}
        title="Fixtures load next"
        description="The full schedule view is wired up in the data phase, reading from the seeded WC2026 dataset."
      />
    </div>
  );
}
