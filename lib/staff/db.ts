import { Pool } from "pg";

let cached: Pool | null = null;

/**
 * Server-side Postgres pool over `DATABASE_URL` — the SAME database the
 * devgathering-2k26 agent writes meal orders to. Never import this from a client
 * component; the connection string must stay on the server.
 */
export function getPool(): Pool {
  if (cached) return cached;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set");
  }
  cached = new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX ?? 5),
    // Managed Postgres (and Supabase poolers) require TLS; allow it without
    // pinning a CA. Opt out locally with PGSSL=disable.
    ssl: process.env.PGSSL === "disable" ? undefined : { rejectUnauthorized: false },
  });
  return cached;
}

/** Run a parameterized query and return the typed rows. */
export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}
