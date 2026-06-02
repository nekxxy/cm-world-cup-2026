import RoadHeroClient from "./RoadHeroClient";
import { HostCitiesSection } from "./sections/HostCitiesSection";
import { TournamentJourneySection } from "./sections/TournamentJourneySection";
import { FanEnergySection } from "./sections/FanEnergySection";
import { FinalDestinationSection } from "./sections/FinalDestinationSection";

/**
 * "The Road to 2026" — a cinematic arrival experience: a full-bleed 3D hero
 * (procedural floodlit pitch + host-city beacons) followed by editorial
 * sections. Replaces the old space/globe landing for signed-out visitors.
 */
export default function CinematicLanding({
  cta,
}: {
  cta?: "login" | "onboarding" | null;
}) {
  return (
    <div>
      <RoadHeroClient cta={cta} />
      <HostCitiesSection />
      <TournamentJourneySection />
      <FanEnergySection />
      <FinalDestinationSection />
    </div>
  );
}
