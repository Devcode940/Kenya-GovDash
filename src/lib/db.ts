import { createShimDb } from './db-shim';

// PrismaClient when its engines are available, otherwise a lightweight
// node:sqlite-based shim exposing the same call surface (see db-shim.ts).
// The fallback activates automatically e.g. in sandboxes where Prisma's
// engine binaries cannot be downloaded.
type DbClient = any;

const globalForDb = globalThis as unknown as {
  __govdashDb: DbClient | undefined;
};

function createDbClient(): DbClient {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require('@prisma/client') as typeof import('@prisma/client');
    return new PrismaClient({
      log: ['query'],
    });
  } catch (err) {
    console.warn(
      '[db] Prisma engine unavailable — using built-in SQLite shim. ' +
        (err instanceof Error ? err.message : String(err)),
    );
    return createShimDb();
  }
}

export const db: DbClient = globalForDb.__govdashDb ?? createDbClient();

if (process.env.NODE_ENV !== 'production') globalForDb.__govdashDb = db;
