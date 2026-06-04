"use client";

import { useEffect, useState } from "react";
import { getTeam } from "@/data/teams";
import { useTelegram } from "@/telegram/useTelegram";
import { useTeamTheme } from "@/theme/useTeamTheme";
import { useBackButton } from "@/telegram/useTelegramUI";
import { cloudGet, cloudSet } from "@/telegram/cloudStorage";
import { hapticImpact, hapticSelection } from "@/telegram/haptics";
import TeamSelector from "@/components/TeamSelector";
import ScrollExperience from "@/components/experience/ScrollExperience";
import TeamBuilder from "@/components/team/TeamBuilder";
import ProfileDashboard from "@/components/profile/ProfileDashboard";
import BottomNav, { BOTTOM_NAV_HEIGHT, type Tab } from "@/components/nav/BottomNav";
import EmptyState from "@/components/ui/EmptyState";

const TEAM_KEY = "wc26_team";

type Phase = "loading" | "select" | "app";

export default function AppShell() {
  const { ready, user } = useTelegram();
  const [phase, setPhase] = useState<Phase>("loading");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("home");

  useTeamTheme(phase === "app" ? teamId : null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    cloudGet(TEAM_KEY).then((saved) => {
      if (cancelled) return;
      if (saved && getTeam(saved)) {
        setTeamId(saved);
        setPhase("app");
      } else {
        setPhase("select");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  // Telegram BackButton returns to Home from any other tab.
  useBackButton(phase === "app" && tab !== "home", () => {
    hapticSelection();
    setTab("home");
  });

  const handleSelect = (id: string) => {
    setTeamId(id);
    setPhase("app");
    setTab("home");
    hapticImpact("medium");
    void cloudSet(TEAM_KEY, id);
  };

  const handleChangeTeam = () => {
    hapticSelection();
    setPhase("select");
  };

  if (phase === "loading") {
    return (
      <main style={center}>
        <p style={{ color: "var(--color-muted)" }}>Loading…</p>
      </main>
    );
  }

  if (phase === "select") {
    return <TeamSelector currentTeamId={teamId} onSelect={handleSelect} />;
  }

  const team = getTeam(teamId);
  if (!team) {
    return <TeamSelector currentTeamId={teamId} onSelect={handleSelect} />;
  }

  return (
    <>
      <div style={{ paddingBottom: `calc(${BOTTOM_NAV_HEIGHT}px + var(--safe-bottom) + 8px)` }}>
        {tab === "home" && (
          <ScrollExperience
            team={team}
            user={user}
            onChangeTeam={handleChangeTeam}
            onOpenBuilder={() => { hapticImpact("light"); setTab("xi"); }}
          />
        )}

        {tab === "xi" && <TeamBuilder team={team} onBack={() => setTab("home")} />}

        {tab === "fixtures" && (
          <EmptyState
            icon="📅"
            title="Fixtures coming next"
            message="All 104 real World Cup 2026 matches — with venues, host cities, and IST kickoff times — will appear here once the official data source is connected. No placeholder fixtures."
          />
        )}

        {tab === "tasks" && (
          <EmptyState
            icon="⭐"
            title="Tasks & rewards"
            message="Complete in-app tasks to earn reminder credits, badges, and Pro perks. This screen is on the way."
          />
        )}

        {tab === "profile" && (
          <ProfileDashboard
            team={team}
            user={user}
            onChangeTeam={handleChangeTeam}
            onOpenBuilder={() => { hapticImpact("light"); setTab("xi"); }}
          />
        )}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </>
  );
}

const center: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
