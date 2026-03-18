console.log("[BOOT] server boot start");

import app from "./app";
import { pool } from "@workspace/db";

console.log("[BOOT] root health route registered");

process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught exception:", err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled promise rejection:", reason);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("[INFO] Received SIGTERM — graceful shutdown initiated");
  pool.end(() => {
    console.log("[INFO] DB pool closed");
    process.exit(0);
  });
});

const dbConfigured = process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGUSER && process.env.PGDATABASE);
if (!dbConfigured) {
  console.error("[FATAL] No database configuration found. Set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE.");
  process.exit(1);
}

const port = Number(process.env["PORT"] ?? 8080);
if (Number.isNaN(port) || port <= 0) {
  console.error(`[FATAL] Invalid PORT value: "${process.env["PORT"]}"`);
  process.exit(1);
}

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[BOOT] listening on port ${port}`);
  console.log("[BOOT] startup complete");

  // DB ping deferred — runs after server is already accepting requests
  pool.connect()
    .then((client) => {
      console.log("[INFO] Database connection verified");
      client.release();
    })
    .catch((err: Error) => {
      console.error("[ERROR] Database connection failed:", err.message);
    });
});

server.on("error", (err) => {
  console.error("[FATAL] Server failed to bind:", err.message);
  process.exit(1);
});
