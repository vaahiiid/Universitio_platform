import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.PGHOST;
  const port = process.env.PGPORT || "5432";
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;

  if (host && user && database) {
    const encodedPassword = password ? encodeURIComponent(password) : "";
    const auth = password ? `${user}:${encodedPassword}` : user;
    return `postgresql://${auth}@${host}:${port}/${database}`;
  }

  throw new Error(
    "Database connection not configured. Set DATABASE_URL or individual PGHOST/PGUSER/PGPASSWORD/PGDATABASE variables.",
  );
}

function getSslConfig(url: string): boolean | { rejectUnauthorized: boolean } | undefined {
  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");
    if (sslmode === "disable") return false;
    if (sslmode === "require" || sslmode === "verify-ca" || sslmode === "verify-full") {
      return { rejectUnauthorized: sslmode === "verify-full" };
    }
  } catch {
    // not a parseable URL — leave ssl unset
  }
  return undefined;
}

const connectionString = getDatabaseUrl();
const ssl = getSslConfig(connectionString);

export const pool = new Pool(ssl !== undefined ? { connectionString, ssl } : { connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
