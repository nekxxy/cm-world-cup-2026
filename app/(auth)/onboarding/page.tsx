import BrandMark from "@/components/ui/BrandMark";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { getTeams } from "@/lib/data";
import { getCurrentUser } from "@/lib/user";

export const metadata = { title: "Pick your teams" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const [user, teams] = await Promise.all([
    getCurrentUser(),
    Promise.resolve(getTeams()),
  ]);

  return (
    <div className="rise-in">
      <div className="mb-6 flex justify-center">
        <BrandMark href={null} className="text-2xl" />
      </div>
      <OnboardingFlow
        teams={teams}
        initialFav={user?.favTeamId ?? null}
        initialFav2={user?.fav2TeamId ?? null}
      />
    </div>
  );
}
