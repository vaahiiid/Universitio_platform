/**
 * Controlled ingestion pipeline for approved mentor replies.
 *
 * Usage (from artifacts/api-server/):
 *
 *   Dry-run  (no file writes, no embeddings):
 *     npx tsx scripts/ingestApprovedKb.ts --dry-run
 *     pnpm --filter @workspace/api-server run ingest-kb -- --dry-run
 *
 *   Real ingest (writes KB, vector store, marks as ingested):
 *     npx tsx scripts/ingestApprovedKb.ts
 *     pnpm --filter @workspace/api-server run ingest-kb
 *
 * Both modes write an audit report to:
 *   src/ai/ingestion_audit_report.json
 *
 * Steps (real mode):
 *   1. Read all "pending_ingest" entries from approved_kb_entries.json
 *   2. Duplicate detection per entry:
 *      a. topSources match  → merge question into that KB entry
 *      b. Jaccard similarity → merge if score ≥ 0.50 (warning if < 0.65)
 *      c. No match          → create new KB entry
 *   3. Re-embed only the affected (new/modified) KB entries via OpenAI
 *   4. Update knowledge_base.json and vector_store.json
 *   5. Mark successfully processed entries as "ingested"
 *   6. Write ingestion_audit_report.json
 *
 * Safe to re-run — already-ingested entries are skipped.
 * NOT triggered automatically; must be run manually.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import type { KnowledgeBaseEntry, VectorStoreEntry } from "../src/ai/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_DIR = path.resolve(__dirname, "../src/ai");
const KB_PATH = path.join(AI_DIR, "knowledge_base.json");
const STORE_PATH = path.join(AI_DIR, "vector_store.json");
const APPROVED_PATH = path.join(AI_DIR, "approved_kb_entries.json");
const AUDIT_PATH = path.join(AI_DIR, "ingestion_audit_report.json");

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 10;

// Similarity thresholds
const JACCARD_THRESHOLD = 0.5;   // below this → new entry
const BORDERLINE_HIGH = 0.65;    // between JACCARD_THRESHOLD and this → borderline warning
const DEDUP_THRESHOLD = 0.85;    // above this → already present, skip

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApprovedEntry {
  id: string;
  sourceQuestion: string;
  humanAnswer: string;
  normalizedQuestion: string;
  domain: string;
  risk_level: "low" | "medium" | "high";
  approvedForKb: true;
  approvedBy: string;
  approvedAt: string;
  status: string;
  ingestedAt?: string;
  conversationId: number;
  aiAnswer?: string;
  reviewLevel?: string;
  topSources?: string[];
}

type KbEntryFull = KnowledgeBaseEntry & {
  status?: string;
  approvedBy?: string;
  approvedAt?: string;
  ingestedAt?: string;
  conversationId?: number;
  source_files?: string[];
  last_converted?: string;
};

type MatchReason =
  | "topSources"
  | "jaccard"
  | "new_entry"
  | "skipped_duplicate";

type EntryAction = "merge" | "create" | "skip";

interface EntryDecision {
  approvedId: string;
  sourceQuestion: string;
  matchedKbId: string | null;
  matchReason: MatchReason;
  similarityScore: number | null;
  isWarning: boolean;
  warningMessage: string | null;
  action: EntryAction;
}

interface AuditReport {
  timestamp: string;
  mode: "dry-run" | "ingest";
  pendingCount: number;
  mergedCount: number;
  createdCount: number;
  skippedCount: number;
  warningCount: number;
  entries: EntryDecision[];
}

// ── Text utilities ─────────────────────────────────────────────────────────────

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function bestJaccardMatch(
  newQuestion: string,
  entries: KbEntryFull[]
): { entry: KbEntryFull; score: number } | null {
  const newTok = tokenize(newQuestion);
  let best: { entry: KbEntryFull; score: number } | null = null;

  for (const entry of entries) {
    for (const sq of entry.sample_questions) {
      const score = jaccardSimilarity(newTok, tokenize(sq));
      if (!best || score > best.score) best = { entry, score };
    }
    const titleScore = jaccardSimilarity(newTok, tokenize(entry.title));
    if (!best || titleScore > best.score) best = { entry, score: titleScore };
  }

  return best && best.score >= JACCARD_THRESHOLD ? best : null;
}

function isAlreadyPresent(question: string, entry: KbEntryFull): boolean {
  const tok = tokenize(question);
  return entry.sample_questions.some(
    (sq) => jaccardSimilarity(tok, tokenize(sq)) >= DEDUP_THRESHOLD
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+$/, "")
    .slice(0, 50);
}

function toTitleCase(text: string): string {
  return text
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function needsHumanReview(riskLevel: "low" | "medium" | "high"): boolean {
  return riskLevel !== "low";
}

// ── Decision analysis (pure — does NOT mutate anything) ───────────────────────

function analyzeEntry(
  approved: ApprovedEntry,
  kb: KbEntryFull[]
): EntryDecision {
  const q = approved.sourceQuestion;

  // 1. topSources primary check
  if (approved.topSources && approved.topSources.length > 0) {
    const topId = approved.topSources[0];
    const directEntry = kb.find((e) => e.id === topId);

    if (directEntry) {
      if (isAlreadyPresent(q, directEntry)) {
        return {
          approvedId: approved.id,
          sourceQuestion: q,
          matchedKbId: topId,
          matchReason: "skipped_duplicate",
          similarityScore: null,
          isWarning: false,
          warningMessage: null,
          action: "skip",
        };
      }
      return {
        approvedId: approved.id,
        sourceQuestion: q,
        matchedKbId: topId,
        matchReason: "topSources",
        similarityScore: null,
        isWarning: false,
        warningMessage: null,
        action: "merge",
      };
    }
  }

  // 2. Jaccard fallback
  const match = bestJaccardMatch(q, kb);
  if (match) {
    if (isAlreadyPresent(q, match.entry)) {
      return {
        approvedId: approved.id,
        sourceQuestion: q,
        matchedKbId: match.entry.id,
        matchReason: "skipped_duplicate",
        similarityScore: Math.round(match.score * 100) / 100,
        isWarning: false,
        warningMessage: null,
        action: "skip",
      };
    }
    const isBorderline =
      match.score >= JACCARD_THRESHOLD && match.score < BORDERLINE_HIGH;
    return {
      approvedId: approved.id,
      sourceQuestion: q,
      matchedKbId: match.entry.id,
      matchReason: "jaccard",
      similarityScore: Math.round(match.score * 100) / 100,
      isWarning: isBorderline,
      warningMessage: isBorderline
        ? `Review suggested before merge — borderline similarity (${match.score.toFixed(2)})`
        : null,
      action: "merge",
    };
  }

  // 3. New entry
  return {
    approvedId: approved.id,
    sourceQuestion: q,
    matchedKbId: null,
    matchReason: "new_entry",
    similarityScore: null,
    isWarning: false,
    warningMessage: null,
    action: "create",
  };
}

// ── Embedding helpers ─────────────────────────────────────────────────────────

function buildEmbedText(entry: KbEntryFull): string {
  return [entry.title, ...entry.sample_questions].join("\n");
}

async function embedBatch(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

// ── Audit printer ─────────────────────────────────────────────────────────────

function printDecision(d: EntryDecision, index: number): void {
  const actionLabel: Record<EntryAction, string> = {
    merge: "MERGE  →",
    create: "CREATE →",
    skip:   "SKIP   ·",
  };
  const reasonLabel: Record<MatchReason, string> = {
    topSources:        "topSources match",
    jaccard:           "Jaccard similarity",
    new_entry:         "no match → new entry",
    skipped_duplicate: "near-identical duplicate",
  };

  console.log(`\n  [${index + 1}] ${d.sourceQuestion.slice(0, 80)}${d.sourceQuestion.length > 80 ? "…" : ""}`);
  console.log(`       Action  : ${actionLabel[d.action]} ${d.matchedKbId ?? "(new KB entry)"}`);
  console.log(`       Reason  : ${reasonLabel[d.matchReason]}${d.similarityScore !== null ? ` (score=${d.similarityScore.toFixed(2)})` : ""}`);
  if (d.isWarning && d.warningMessage) {
    console.log(`       ⚠ WARNING: ${d.warningMessage}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const isDryRun = process.argv.includes("--dry-run");
  const modeLabel = isDryRun ? "DRY-RUN" : "INGEST";

  console.log("\n═══════════════════════════════════════════════════");
  console.log(` AskiMate KB Ingestion Pipeline  [${modeLabel}]`);
  if (isDryRun) {
    console.log("  (No files will be modified. No embeddings generated.)");
  }
  console.log("═══════════════════════════════════════════════════\n");

  // ── Load pending entries ───────────────────────────────────────────────────
  if (!fs.existsSync(APPROVED_PATH)) {
    console.log("[INGEST] approved_kb_entries.json not found — nothing to do.");
    return;
  }

  const allApproved: ApprovedEntry[] = JSON.parse(
    fs.readFileSync(APPROVED_PATH, "utf-8")
  );
  const pending = allApproved.filter((e) => e.status === "pending_ingest");

  console.log(`[INGEST] Approved entries total : ${allApproved.length}`);
  console.log(`[INGEST] Pending (to process)    : ${pending.length}`);
  console.log(
    `[INGEST] Already ingested       : ${allApproved.filter((e) => e.status === "ingested").length}\n`
  );

  if (pending.length === 0) {
    console.log("[INGEST] Nothing to process. Done.\n");
    return;
  }

  // ── Load KB ────────────────────────────────────────────────────────────────
  if (!fs.existsSync(KB_PATH)) {
    throw new Error(`[INGEST] knowledge_base.json not found at ${KB_PATH}`);
  }
  if (!fs.existsSync(STORE_PATH)) {
    throw new Error(`[INGEST] vector_store.json not found at ${STORE_PATH}`);
  }

  // Load KB into a working copy (mutations only happen in real-ingest mode)
  const kb: KbEntryFull[] = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  const vectorStore: VectorStoreEntry[] = JSON.parse(
    fs.readFileSync(STORE_PATH, "utf-8")
  );

  console.log(`[INGEST] KB loaded              : ${kb.length} entries`);
  console.log(`[INGEST] Vector store loaded    : ${vectorStore.length} embeddings\n`);

  // ── Analyse all entries (pure, no mutations) ───────────────────────────────
  // We analyse against a clean copy so decisions don't interfere with each other
  // in dry-run, and in real mode we re-analyse sequentially while applying.
  const decisions: EntryDecision[] = [];
  for (const approved of pending) {
    decisions.push(analyzeEntry(approved, kb));
  }

  // ── Count metrics ──────────────────────────────────────────────────────────
  const mergedDecisions  = decisions.filter((d) => d.action === "merge");
  const createdDecisions = decisions.filter((d) => d.action === "create");
  const skippedDecisions = decisions.filter((d) => d.action === "skip");
  const warningDecisions = decisions.filter((d) => d.isWarning);

  // ── Print per-entry audit report ───────────────────────────────────────────
  console.log(`[INGEST] ── Per-entry decision report ──────────────────`);
  decisions.forEach((d, i) => printDecision(d, i));
  console.log();

  // ── Dry-run path: write audit file and stop ────────────────────────────────
  if (isDryRun) {
    const audit: AuditReport = {
      timestamp: new Date().toISOString(),
      mode: "dry-run",
      pendingCount: pending.length,
      mergedCount: mergedDecisions.length,
      createdCount: createdDecisions.length,
      skippedCount: skippedDecisions.length,
      warningCount: warningDecisions.length,
      entries: decisions,
    };
    fs.writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2));

    console.log("─────────────────────────────────────────────────────");
    console.log(" Dry-Run Summary (nothing was modified)");
    console.log("─────────────────────────────────────────────────────");
    console.log(`  Pending entries         : ${pending.length}`);
    console.log(`  Would merge             : ${mergedDecisions.length}`);
    console.log(`  Would create            : ${createdDecisions.length}`);
    console.log(`  Would skip (duplicate)  : ${skippedDecisions.length}`);
    console.log(`  Warnings (review first) : ${warningDecisions.length}`);
    console.log(`  Embeddings generated    : 0  (dry-run)`);
    console.log(`  Files modified          : 0  (dry-run)`);
    console.log("═══════════════════════════════════════════════════\n");

    if (warningDecisions.length > 0) {
      console.log("⚠  WARNINGS — review these entries before ingesting:");
      warningDecisions.forEach((d) => {
        console.log(`   · "${d.sourceQuestion.slice(0, 70)}" → "${d.matchedKbId}" (${d.warningMessage})`);
      });
      console.log();
    }

    console.log(`[INGEST] Audit report saved: ${AUDIT_PATH}\n`);
    console.log(
      '[INGEST] To run real ingest: npx tsx scripts/ingestApprovedKb.ts\n'
    );
    return;
  }

  // ── Real ingest path ───────────────────────────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "[INGEST] OPENAI_API_KEY is not set. Export it before running."
    );
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const affectedIds = new Set<string>();
  const successIds = new Set<string>();
  let mergedCount = 0;
  let createdCount = 0;
  let skippedDuplicateCount = 0;

  for (let i = 0; i < pending.length; i++) {
    const approved = pending[i];
    const d = decisions[i];
    const q = approved.sourceQuestion;

    console.log(`[INGEST] ─── ${approved.id.slice(0, 8)}… [${d.action.toUpperCase()}] ───`);
    console.log(`           "${q.slice(0, 80)}${q.length > 80 ? "…" : ""}"`);

    if (d.isWarning && d.warningMessage) {
      console.log(`           ⚠ ${d.warningMessage}`);
    }

    if (d.action === "skip") {
      console.log(`           SKIP — near-identical already in "${d.matchedKbId}"`);
      skippedDuplicateCount++;
      successIds.add(approved.id);
      continue;
    }

    if (d.action === "merge" && d.matchedKbId) {
      const targetEntry = kb.find((e) => e.id === d.matchedKbId);
      if (targetEntry) {
        targetEntry.sample_questions.push(q);
        const via = d.matchReason === "topSources" ? "topSources" : `Jaccard=${d.similarityScore?.toFixed(2)}`;
        console.log(`           MERGED → "${d.matchedKbId}" (via ${via})`);
        mergedCount++;
        affectedIds.add(d.matchedKbId);
        successIds.add(approved.id);
      } else {
        console.log(`           ERROR — target entry "${d.matchedKbId}" not found in KB. Skipped.`);
      }
      continue;
    }

    if (d.action === "create") {
      const baseId = slugify(approved.normalizedQuestion || q);
      let uniqueId = baseId;
      let counter = 1;
      while (kb.some((e) => e.id === uniqueId)) {
        uniqueId = `${baseId}_${counter++}`;
      }
      const newEntry: KbEntryFull = {
        id: uniqueId,
        title: toTitleCase(q.length <= 60 ? q : q.slice(0, 57) + "…"),
        domain: approved.domain || "general",
        risk_level: approved.risk_level,
        needs_human_review: needsHumanReview(approved.risk_level),
        sample_questions: [q],
        answer_variants: [approved.humanAnswer],
        status: "approved_kb_entry",
        approvedBy: approved.approvedBy,
        approvedAt: approved.approvedAt,
        ingestedAt: new Date().toISOString(),
        conversationId: approved.conversationId,
      };
      kb.push(newEntry);
      affectedIds.add(uniqueId);
      createdCount++;
      successIds.add(approved.id);
      console.log(`           CREATED new KB entry "${uniqueId}"`);
    }
  }

  // ── Re-embed only affected entries ─────────────────────────────────────────
  const toEmbed = kb.filter((e) => affectedIds.has(e.id));
  let embeddedCount = 0;

  if (toEmbed.length > 0) {
    console.log(
      `\n[INGEST] Re-embedding ${toEmbed.length} affected entr${toEmbed.length === 1 ? "y" : "ies"}…`
    );

    const newEmbeddings = new Map<string, number[]>();

    for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
      const batch = toEmbed.slice(i, i + BATCH_SIZE);
      const embeddings = await embedBatch(openai, batch.map(buildEmbedText));
      for (let j = 0; j < batch.length; j++) {
        newEmbeddings.set(batch[j].id, embeddings[j]);
      }
      console.log(`[INGEST]   Embedded ${Math.min(i + BATCH_SIZE, toEmbed.length)}/${toEmbed.length}`);
    }

    embeddedCount = newEmbeddings.size;

    // Patch vector store — replace updated, append new
    const updatedStore: VectorStoreEntry[] = vectorStore.map((ve) => {
      if (newEmbeddings.has(ve.id)) {
        const kbEntry = kb.find((e) => e.id === ve.id)!;
        return {
          id: ve.id,
          title: kbEntry.title,
          risk_level: kbEntry.risk_level,
          needs_human_review: kbEntry.needs_human_review,
          answer: kbEntry.answer_variants[0] ?? "",
          embedding: newEmbeddings.get(ve.id)!,
        };
      }
      return ve;
    });
    for (const [id, embedding] of newEmbeddings) {
      if (!vectorStore.some((ve) => ve.id === id)) {
        const kbEntry = kb.find((e) => e.id === id)!;
        updatedStore.push({
          id,
          title: kbEntry.title,
          risk_level: kbEntry.risk_level,
          needs_human_review: kbEntry.needs_human_review,
          answer: kbEntry.answer_variants[0] ?? "",
          embedding,
        });
      }
    }

    fs.writeFileSync(KB_PATH, JSON.stringify(kb, null, 2));
    console.log(`\n[INGEST] knowledge_base.json updated (${kb.length} entries)`);

    fs.writeFileSync(STORE_PATH, JSON.stringify(updatedStore, null, 2));
    console.log(`[INGEST] vector_store.json updated (${updatedStore.length} entries)`);
  } else {
    console.log(
      "\n[INGEST] No KB entries needed re-embedding (all were skipped as duplicates)."
    );
  }

  // ── Mark as ingested ───────────────────────────────────────────────────────
  const now = new Date().toISOString();
  const finalApproved = allApproved.map((e) =>
    successIds.has(e.id) ? { ...e, status: "ingested", ingestedAt: now } : e
  );
  fs.writeFileSync(APPROVED_PATH, JSON.stringify(finalApproved, null, 2));

  // ── Write audit report ─────────────────────────────────────────────────────
  const audit: AuditReport = {
    timestamp: now,
    mode: "ingest",
    pendingCount: pending.length,
    mergedCount,
    createdCount,
    skippedCount: skippedDuplicateCount,
    warningCount: warningDecisions.length,
    entries: decisions,
  };
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(audit, null, 2));

  const failedCount = pending.length - successIds.size;

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log(" Ingestion Summary");
  console.log("───────────────────────────────────────────────────");
  console.log(`  Pending entries found      : ${pending.length}`);
  console.log(`  Merged into existing       : ${mergedCount}`);
  console.log(`  New KB entries created     : ${createdCount}`);
  console.log(`  Skipped (already present)  : ${skippedDuplicateCount}`);
  console.log(`  Embeddings re-generated    : ${embeddedCount}`);
  console.log(`  Marked as ingested         : ${successIds.size}`);
  console.log(`  Failed / unchanged         : ${failedCount}`);
  console.log(`  Warnings flagged           : ${warningDecisions.length}`);
  console.log("═══════════════════════════════════════════════════\n");

  if (warningDecisions.length > 0) {
    console.log("⚠  WARNINGS were present — review ingestion_audit_report.json:");
    warningDecisions.forEach((d) => {
      console.log(`   · "${d.sourceQuestion.slice(0, 70)}" → "${d.matchedKbId}"`);
    });
    console.log();
  }

  if (failedCount > 0) {
    console.log(
      "[INGEST] NOTE: Some entries were not processed. Check output above.\n"
    );
  }

  if (embeddedCount > 0) {
    console.log(
      "[INGEST] ⚠  Restart the API server to reload the updated vector store into memory.\n"
    );
  }

  console.log(`[INGEST] Audit report saved: ${AUDIT_PATH}\n`);
}

main().catch((err) => {
  console.error("\n[INGEST] Fatal error:", err);
  process.exit(1);
});
