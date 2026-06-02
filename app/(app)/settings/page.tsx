import Link from "next/link";
import { Bell, Pencil, Star, Smartphone } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Flag from "@/components/ui/Flag";
import { ButtonLink } from "@/components/ui/Button";
import NotifyToggle from "@/components/settings/NotifyToggle";
import WebPushToggle from "@/components/settings/WebPushToggle";
import LogoutButton from "@/components/settings/LogoutButton";
import { getCurrentUser } from "@/lib/user";
import { getTeam } from "@/lib/data";

export const metadata = { title: "You" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="rise-in">
        <PageHeader kicker="Your account" title="You" />
        <div className="glass rounded-2xl p-5 text-center text-sm text-dim">
          <p>We couldn&apos;t load your account.</p>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  const favTeam = getTeam(user.favTeamId);
  const fav2Team = getTeam(user.fav2TeamId);
  const initial = (user.firstName || "?").charAt(0).toUpperCase();

  return (
    <div className="rise-in">
      <PageHeader kicker="Your account" title="You" />

      {/* Profile */}
      <div className="glass mb-5 flex items-center gap-4 rounded-2xl p-4">
        <span className="grid size-14 place-items-center rounded-full bg-accent/20 font-display text-2xl text-accent">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-xl tracking-wide text-text">
            {user.firstName}
            {user.lastName ? ` ${user.lastName}` : ""}
          </p>
          {user.username ? (
            <p className="truncate text-sm text-dim">@{user.username}</p>
          ) : null}
        </div>
      </div>

      {/* Favourites */}
      <section className="mb-5">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg tracking-wide">
            <Star className="size-4 text-accent" />
            Your teams
          </h2>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent"
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>
        </div>
        {favTeam ? (
          <div className="space-y-2.5">
            <TeamRow team={favTeam} label="Favourite" />
            {fav2Team ? (
              <TeamRow team={fav2Team} label="Second favourite" />
            ) : null}
          </div>
        ) : (
          <ButtonLink href="/onboarding" className="w-full">
            Pick your two teams
          </ButtonLink>
        )}
      </section>

      {/* Notifications */}
      <section className="mb-8">
        <h2 className="mb-2.5 font-display text-lg tracking-wide">Notifications</h2>
        <div className="glass space-y-4 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface2 text-accent">
              <Bell className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-text">Telegram reminders</p>
              <p className="text-xs text-dim">
                DM 30 min before &amp; at kickoff (IST)
              </p>
            </div>
            <NotifyToggle initial={user.notifyEnabled} />
          </div>
          <div className="flex items-center gap-3 border-t border-line pt-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface2 text-accent">
              <Smartphone className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-text">Browser alerts</p>
              <p className="text-xs text-dim">
                Web push for this installed device
              </p>
            </div>
            <WebPushToggle />
          </div>
        </div>
      </section>

      <LogoutButton />
    </div>
  );
}

function TeamRow({ team, label }: { team: NonNullable<ReturnType<typeof getTeam>>; label: string }) {
  return (
    <Link
      href={`/teams/${team.id}`}
      className="glass flex items-center gap-3 rounded-2xl p-3 transition hover:border-white/20"
    >
      <Flag team={team} size={40} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
          {label}
        </p>
        <p className="truncate font-bold text-text">{team.name}</p>
      </div>
      {team.groupId ? (
        <span className="text-xs font-semibold text-dim">Group {team.groupId}</span>
      ) : null}
    </Link>
  );
}
