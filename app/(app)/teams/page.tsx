import { Shield } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import TeamsBrowser from "@/components/TeamsBrowser";
import { getTeams } from "@/lib/data";
import { TOURNAMENT } from "@/lib/constants";

export const metadata = { title: "Teams" };

export default function TeamsPage() {
  const teams = getTeams();

  return (
    <div className="rise-in">
      <PageHeader
        kicker={`${TOURNAMENT.teams} nations · ${TOURNAMENT.groups} groups`}
        title="Teams"
        subtitle="Flags, groups and FIFA ranks for every side."
      />
      {teams.length === 0 ? (
        <EmptyState
          Icon={Shield}
          title="Teams not seeded yet"
          description="Run `npm run seed` with an API-Football key to load all 48 teams and 12 groups. We never fabricate the draw."
        />
      ) : (
        <TeamsBrowser teams={teams} />
      )}
    </div>
  );
}
