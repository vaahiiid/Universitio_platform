/**
 * Controlled ingestion pipeline for approved mentor replies.
 *
 * Run from the api-server directory:
 *   npx tsx scripts/ingestApprovedKb.ts
 *
 * Steps performed:
 *   1. Read all "pending_ingest" entries from approved_kb_entries.json
 *   2. For each entry, check for duplicates in the existing knowledge base
 *      a. topSources match  → merge question into that entry
 *      b. Jaccard similarity → merge into closest entry if score ≥ 0.50
 *      c. No match          → create a new KB entry
 *   3. Re-embed only the affected (new/modified) KB entries via OpenAI
 *   4. Update knowledge_base.json and vector_store.json
 *   5. Mark successfully processed entries as "ingested" in approved_kb_entries.json
 *   6. Print a clear summary
 *
 * This script is safe to re-run. Already-ingested entries are skipped.
 * It does NOT auto-run — it must be triggered manually.
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

const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 10;

// Jaccard threshold: approved question is a duplicate if the best match scores above this
const JACCARD_THRESHOLD = 0.5;
// Near-identical threshold: skip appending if already present at this level
const DEDUP_THRESHOLD = 0.85;

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

// KnowledgeBaseEntry extended with optional provenance fields present in the JSON file
type KbEntryFull = KnowledgeBaseEntry & {
  status?: string;
  approvedBy?: string;
  approvedAt?: string;
  ingestedAt?: string;
  conversationId?: number;
  source_files?: string[];
  last_converted?: string;
};

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
    // Compare against each sample question
    for (const sq of entry.sample_questions) {
      const score = jaccardSimilarity(newTok, tokenize(sq));
      if (!best || score > best.score) best = { entry, score };
    }
    // Also compare against the entry title
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

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n═══════════════════════════════════════════════════");
  console.log(" AskiMate KB Ingestion Pipeline");
  console.log("═══════════════════════════════════════════════════\n");

  // ── 1. Load pending approved entries ──────────────────────────────────────
  if (!fs.existsSync(APPROVED_PATH)) {
    console.log("[INGEST] approved_kb_entries.json not found — nothing to do.");
    return;
  }

  const allApproved: ApprovedEntry[] = JSON.parse(
    fs.readFileSync(APPROVED_PATH, "utf-8")
  );
  const pending = allApproved.filter((e) => e.status === "pending_ingest");

  console.log(
    `[INGEST] Approved entries total : ${allApproved.length}`
  );
  console.log(`[INGEST] Pending (to process)    : ${pending.length}`);
  console.log(
    `[INGEST] Already ingested       : ${allApproved.filter((e) => e.status === "ingested").length}\n`
  );

  if (pending.length === 0) {
    console.log("[INGEST] Nothing to process. Done.\n");
    return;
  }

  // ── 2. Load existing KB and vector store ──────────────────────────────────
  if (!fs.existsSync(KB_PATH)) {
    throw new Error(`[INGEST] knowledge_base.json not found at ${KB_PATH}`);
  }
  if (!fs.existsSync(STORE_PATH)) {
    throw new Error(`[INGEST] vector_store.json not found at ${STORE_PATH}`);
  }

  const kb: KbEntryFull[] = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  const vectorStore: VectorStoreEntry[] = JSON.parse(
    fs.readFileSync(STORE_PATH, "utf-8")
  );

  console.log(`[INGEST] KB loaded              : ${kb.length} entries`);
  console.log(
    `[INGEST] Vector store loaded    : ${vectorStore.length} embeddings\n`
  );

  // ── 3. Initialise OpenAI ──────────────────────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "[INGEST] OPENAI_API_KEY is not set. Export it before running."
    );
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // ── 4. Process each pending entry ─────────────────────────────────────────
  const affectedIds = new Set<string>();
  const successIds = new Set<string>();
  let mergedCount = 0;
  let createdCount = 0;
  let skippedDuplicateCount = 0;

  for (const approved of pending) {
    const q = approved.sourceQuestion;
    console.log(`\n[INGEST] ─── Processing entry ${approved.id.slice(0, 8)}… ───`);
    console.log(`           Question : "${q.slice(0, 90)}${q.length > 90 ? "…" : ""}"`);
    console.log(`           Domain   : ${approved.domain}  Risk: ${approved.risk_level}`);
    console.log(`           Sources  : ${(approved.topSources ?? []).join(", ") || "—"}`);

    let handled = false;

    // ── 4a. Check topSources (primary: the KB entry the AI matched to) ─────
    if (approved.topSources && approved.topSources.length > 0) {
      const topId = approved.topSources[0];
      const directEntry = kb.find((e) => e.id === topId);

      if (directEntry) {
        if (isAlreadyPresent(q, directEntry)) {
          console.log(
            `[INGEST]   SKIP (near-identical already in "${topId}")`
          );
          skippedDuplicateCount++;
          successIds.add(approved.id); // still mark as ingested — no action needed
        } else {
          directEntry.sample_questions.push(q);
          console.log(
            `[INGEST]   MERGED question → existing entry "${topId}" (via topSources)`
          );
          mergedCount++;
          affectedIds.add(topId);
          successIds.add(approved.id);
        }
        handled = true;
      }
    }

    // ── 4b. Jaccard fallback ──────────────────────────────────────────────
    if (!handled) {
      const match = bestJaccardMatch(q, kb);

      if (match) {
        if (isAlreadyPresent(q, match.entry)) {
          console.log(
            `[INGEST]   SKIP (near-identical already in "${match.entry.id}", Jaccard=${match.score.toFixed(2)})`
          );
          skippedDuplicateCount++;
          successIds.add(approved.id);
        } else {
          match.entry.sample_questions.push(q);
          console.log(
            `[INGEST]   MERGED question → existing entry "${match.entry.id}" (Jaccard=${match.score.toFixed(2)})`
          );
          mergedCount++;
          affectedIds.add(match.entry.id);
          successIds.add(approved.id);
        }
        handled = true;
      }
    }

    // ── 4c. Create new KB entry ───────────────────────────────────────────
    if (!handled) {
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
      console.log(`[INGEST]   CREATED new KB entry "${uniqueId}"`);
    }
  }

  // ── 5. Re-embed only affected entries ─────────────────────────────────────
  const toEmbed = kb.filter((e) => affectedIds.has(e.id));

  let embeddedCount = 0;
  if (toEmbed.length > 0) {
    console.log(
      `\n[INGEST] Re-embedding ${toEmbed.length} affected entr${toEmbed.length === 1 ? "y" : "ies"}…`
    );

    const newEmbeddings = new Map<string, number[]>();

    for (let i = 0; i < toEmbed.length; i += BATCH_SIZE) {
      const batch = toEmbed.slice(i, i + BATCH_SIZE);
      const texts = batch.map(buildEmbedText);
      const embeddings = await embedBatch(openai, texts);

      for (let j = 0; j < batch.length; j++) {
        newEmbeddings.set(batch[j].id, embeddings[j]);
      }

      const done = Math.min(i + BATCH_SIZE, toEmbed.length);
      console.log(`[INGEST]   Embedded ${done}/${toEmbed.length}`);
    }

    embeddedCount = newEmbeddings.size;

    // ── 6. Patch vector store ──────────────────────────────────────────────
    // Replace existing entries that have updated embeddings
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

    // Append brand-new entries not yet in the vector store
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

    // Write updated files
    fs.writeFileSync(KB_PATH, JSON.stringify(kb, null, 2));
    console.log(`\n[INGEST] knowledge_base.json updated (${kb.length} entries)`);

    fs.writeFileSync(STORE_PATH, JSON.stringify(updatedStore, null, 2));
    console.log(`[INGEST] vector_store.json updated (${updatedStore.length} entries)`);
  } else {
    console.log(
      "\n[INGEST] No KB entries needed re-embedding (all were skipped as near-duplicates)."
    );
    // KB unchanged — write anyway to preserve any minor in-memory mutations (shouldn't happen, but safe)
  }

  // ── 7. Mark ingested entries in approved_kb_entries.json ─────────────────
  const now = new Date().toISOString();
  const finalApproved = allApproved.map((e) =>
    successIds.has(e.id)
      ? { ...e, status: "ingested", ingestedAt: now }
      : e
  );
  fs.writeFileSync(APPROVED_PATH, JSON.stringify(finalApproved, null, 2));

  const failedCount = pending.length - successIds.size;

  // ── 8. Summary ────────────────────────────────────────────────────────────
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
  console.log("═══════════════════════════════════════════════════\n");

  if (failedCount > 0) {
    console.log(
      "[INGEST] WARNING: Some entries were not processed. Check output above.\n"
    );
  }

  if (embeddedCount > 0) {
    console.log(
      "[INGEST] ⚠  Restart the API server to reload the updated vector store into memory.\n"
    );
  }
}

main().catch((err) => {
  console.error("\n[INGEST] Fatal error:", err);
  process.exit(1);
});
