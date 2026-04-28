import "@/lib/runtime-env.mjs";
import { PrismaClient } from "@prisma/client";
import { ensureDatabaseInitialized, getConfiguredDatabaseUrl } from "@/lib/sqlite-schema.mjs";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = getConfiguredDatabaseUrl();
const isNextProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

if (!isNextProductionBuild) {
  ensureDatabaseInitialized(databaseUrl);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
