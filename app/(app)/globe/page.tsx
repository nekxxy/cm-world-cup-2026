import { Globe2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Globe" };

export default function GlobePage() {
  return (
    <div className="rise-in">
      <PageHeader
        kicker="16 host cities"
        title="The Globe"
        subtitle="Spin a realistic Earth and explore every venue."
      />
      <EmptyState
        Icon={Globe2}
        title="Globe coming online"
        description="The interactive 3D globe — host-city pins, glowing arcs and fly-to — lands in a later build phase."
      />
    </div>
  );
}
