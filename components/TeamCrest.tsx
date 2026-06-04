import type { Team } from "@/data/teams";

/**
 * A two-tone crest built from the team's brand colours. Used instead of emoji
 * flags because Android (a big share of our Indian audience) frequently can't
 * render regional-indicator flag emoji, showing letter boxes instead.
 */
export default function TeamCrest({ team, size = 28 }: { team: Team; size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        borderRadius: size * 0.28,
        overflow: "hidden",
        flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
      }}
    >
      <span style={{ flex: 1, background: team.primary }} />
      <span style={{ flex: 1, background: team.secondary }} />
    </span>
  );
}
