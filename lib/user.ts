import { getSession } from "./auth";
import { prisma } from "./db";
import type { User } from "@prisma/client";

/**
 * The signed-in user's full DB record (favourites, notify prefs), or null if
 * not signed in / the database isn't reachable (keyless dev).
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    return await prisma.user.findUnique({ where: { id: session.uid } });
  } catch {
    return null;
  }
}
