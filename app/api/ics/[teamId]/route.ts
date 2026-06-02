import { getTeam, getMatchesForTeam } from "@/lib/data";
import { buildTeamIcs } from "@/lib/ics";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;
  const team = getTeam(Number(teamId));
  if (!team) {
    return new Response("Team not found", { status: 404 });
  }

  const matches = getMatchesForTeam(team.id);
  const body = buildTeamIcs(team, matches);
  const slug = team.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="wc26-${slug}.ics"`,
      "cache-control": "public, max-age=3600",
    },
  });
}
