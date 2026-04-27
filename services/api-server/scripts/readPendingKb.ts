/**
 * Admin utility — list all pending-ingest approved KB entries.
 *
 * Usage (from artifacts/api-server/):
 *   npx tsx scripts/readPendingKb.ts
 *   npx tsx scripts/readPendingKb.ts --all   # show all, not just pending
 */
import { getPendingEntries, getAllApprovedEntries } from "../src/ai/pendingKbManager";

const showAll = process.argv.includes("--all");
const entries = showAll ? getAllApprovedEntries() : getPendingEntries();

if (entries.length === 0) {
  console.log(showAll ? "No approved KB entries found." : "No pending entries. All clear.");
  process.exit(0);
}

console.log(`\n=== ${showAll ? "All" : "Pending"} KB entries: ${entries.length} ===\n`);

for (const e of entries) {
  console.log(`────────────────────────────────────────`);
  console.log(`ID         : ${e.id}`);
  console.log(`Status     : ${e.status}`);
  console.log(`Question   : ${e.sourceQuestion}`);
  console.log(`Domain     : ${e.domain}`);
  console.log(`Risk       : ${e.risk_level}`);
  console.log(`ReviewLevel: ${e.reviewLevel ?? "—"}`);
  console.log(`TopSources : ${(e.topSources ?? []).join(", ") || "—"}`);
  console.log(`ApprovedBy : ${e.approvedBy}`);
  console.log(`ApprovedAt : ${e.approvedAt}`);
  console.log(`Human ans  : ${e.humanAnswer.slice(0, 120)}${e.humanAnswer.length > 120 ? "…" : ""}`);
  if (e.aiAnswer) {
    console.log(`AI attempt : ${e.aiAnswer.slice(0, 120)}${e.aiAnswer.length > 120 ? "…" : ""}`);
  }
  console.log();
}
