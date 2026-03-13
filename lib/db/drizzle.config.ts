import { defineConfig } from "drizzle-kit";
import path from "path";

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const { PGHOST, PGPORT = "5432", PGUSER, PGPASSWORD, PGDATABASE } = process.env;
  if (PGHOST && PGUSER && PGDATABASE) {
    const auth = PGPASSWORD ? `${PGUSER}:${encodeURIComponent(PGPASSWORD)}` : PGUSER;
    return `postgresql://${auth}@${PGHOST}:${PGPORT}/${PGDATABASE}`;
  }
  throw new Error("DATABASE_URL or PGHOST/PGUSER/PGDATABASE must be set.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
