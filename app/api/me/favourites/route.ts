import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTeam, hasTeamData } from "@/lib/data";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data: {
    favTeamId?: number | null;
    fav2TeamId?: number | null;
    notifyEnabled?: boolean;
  } = {};

  const parseTeam = (v: unknown): number | null | undefined => {
    if (v === null) return null;
    if (v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const fav = parseTeam(body.favTeamId);
  const fav2 = parseTeam(body.fav2TeamId);

  // Validate against the seed when team data is present (no fabrication).
  if (hasTeamData()) {
    if (typeof fav === "number" && !getTeam(fav)) {
      return NextResponse.json({ error: "Unknown team" }, { status: 400 });
    }
    if (typeof fav2 === "number" && !getTeam(fav2)) {
      return NextResponse.json({ error: "Unknown team" }, { status: 400 });
    }
  }
  if (typeof fav === "number" && typeof fav2 === "number" && fav === fav2) {
    return NextResponse.json(
      { error: "Pick two different teams" },
      { status: 400 },
    );
  }

  if (fav !== undefined) data.favTeamId = fav;
  if (fav2 !== undefined) data.fav2TeamId = fav2;
  if (typeof body.notifyEnabled === "boolean") {
    data.notifyEnabled = body.notifyEnabled;
  }

  try {
    await prisma.user.update({ where: { id: session.uid }, data });
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
