import app from "./app";

const requiredVars = ["PORT"];
const dbConfigured = process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE);
if (!dbConfigured) {
  console.error("FATAL: No database configuration found. Set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE.");
  process.exit(1);
}

const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length) {
  console.error(`FATAL: Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const port = Number(process.env["PORT"]);

if (Number.isNaN(port) || port <= 0) {
  console.error(`FATAL: Invalid PORT value: "${process.env["PORT"]}"`);
  process.exit(1);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
