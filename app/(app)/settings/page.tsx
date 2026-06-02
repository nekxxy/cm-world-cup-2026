import { UserRound } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";

export const metadata = { title: "You" };

export default function SettingsPage() {
  return (
    <div className="rise-in">
      <PageHeader
        kicker="Your account"
        title="You"
        subtitle="Favourites, reminders and preferences."
      />
      <EmptyState
        Icon={UserRound}
        title="Sign in to personalise"
        description="Log in with Telegram to pick your two favourite teams and get kickoff reminders."
        action={<ButtonLink href="/login">Log in with Telegram</ButtonLink>}
      />
    </div>
  );
}
