"use client";

import { useEffect, useState } from "react";
import { getTeam } from "@/data/teams";
import { useTelegram } from "@/telegram/useTelegram";
import { useTeamTheme } from "@/theme/useTeamTheme";
import { cloudGet, cloudSet } from "@/telegram/cloudStorage";
import { hapticImpact, hapticSelection } from "@/telegram/haptics";
import TeamSelector from "@/components/TeamSelector";
import ScrollExperience from "@/components/experience/ScrollExperience";

const TEAM_KEY = "wc26_team";

type Phase = "loading" | "select" | "home";

export default function AppShell() {
  const { ready, user } = useTelegram();
  const [phase, setPhase] = useState<Phase>("loading");
  const [teamId, setTeamId] = useState<string | null>(null);

  // Re-theme the whole app whenever the pick changes (neutral while choosing).
  useTeamTheme(phase === "home" ? teamId : null);

  // On launch, read the saved pick from CloudStorage and skip straight to home.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    cloudGet(TEAM_KEY).then((saved) => {
      if (cancelled) return;
      if (saved && getTeam(saved)) {
        setTeamId(saved);
        setPhase("home");
      } else {
        setPhase("select");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const handleSelect = (id: string) => {
    setTeamId(id);
    setPhase("home");
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
    // Defensive: id somehow invalid — fall back to selection.
    return <TeamSelector currentTeamId={teamId} onSelect={handleSelect} />;
  }

  return <ScrollExperience team={team} user={user} onChangeTeam={handleChangeTeam} />;
}

const center: React.CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
