import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton. Reused across hot reloads in dev to avoid exhausting
 * connections. A safe default URL keeps instantiation from throwing when
 * DATABASE_URL is unset (e.g. keyless builds) — queries simply target the
 * local SQLite file until configured.
 */
const datasourceUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";

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
