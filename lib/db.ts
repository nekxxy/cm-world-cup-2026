import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton. Reused across hot reloads in dev to avoid exhausting
 * connections. The non-connecting Postgres placeholder keeps instantiation
 * from throwing during keyless builds (when DATABASE_URL is unset) — it's
 * never actually connected to; real queries use the injected DATABASE_URL.
 */
const datasourceUrl =
  process.env.DATABASE_URL ?? "postgresql://placeholder:5432/db";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
