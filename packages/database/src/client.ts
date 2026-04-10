import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple Prisma instances in development (hot reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Check if database URL is configured
const hasDatabase = !!process.env.DATABASE_URL;

function createPrismaClient() {
  if (!hasDatabase) {
    // Return a mock client that will throw helpful errors if used
    return new Proxy({} as PrismaClient, {
      get: () => {
        throw new Error(
          "Database not configured. Set DATABASE_URL environment variable to use database features."
        );
      },
    });
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

let db: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // In production, create a new client (or use cached global)
  db = globalThis.__prisma ?? createPrismaClient();
} else {
  // In development, use global to prevent multiple instances during hot reload
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  db = globalThis.__prisma;
}

export { db, PrismaClient, hasDatabase };