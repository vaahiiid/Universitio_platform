/**
 * One-time targeted re-embed script.
 * Re-embeds specific KB entries whose sample_questions changed directly in knowledge_base.json.
 * Patches vector_store.json in-place for only the listed entry IDs.
 * Does NOT touch any other code or architecture.
 *
 * Usage:  pnpm --filter @workspace/api-server run reembed
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import type { KnowledgeBaseEntry } from "../src/ai/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AI_DIR    = path.join(__dirname, "../src/ai");
const KB_PATH   = path.join(AI_DIR, "knowledge_base.json");
const STORE_PATH = path.join(AI_DIR, "vector_store.json");
const MODEL = "text-embedding-3-small";

// Exact replica of buildEmbedText() in ingestApprovedKb.ts — must stay in sync
function buildEmbedText(entry: KnowledgeBaseEntry): string {
  return [entry.title, ...entry.sample_questions].join("\n");
}

// Only the entries whose KB sample_questions were directly edited
const TARGET_IDS = [
  "tuition_fees",      // stale embedding — affordability sample questions were never re-embedded
];

async function main() {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const kb: KnowledgeBaseEntry[] = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  const store: Array<Record<string, unknown>> = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));

  const targets = TARGET_IDS.map(id => {
    const entry = kb.find(e => e.id === id);
    if (!entry) throw new Error(`Entry not found in KB: ${id}`);
    return entry;
  });

  console.log(`\n[REEMBED] Re-embedding ${targets.length} entries: ${TARGET_IDS.join(", ")}`);

  const texts = targets.map(buildEmbedText);

  // Show what is being embedded for each entry
  targets.forEach((t, i) => {
    console.log(`\n  [${t.id}] embedded text (${texts[i].split("\n").length} lines):`);
    texts[i].split("\n").forEach(l => console.log(`    ${l}`));
  });

  console.log("\n[REEMBED] Calling OpenAI embeddings API...");
  const resp = await client.embeddings.create({ model: MODEL, input: texts });
  const newEmbeddings = new Map(targets.map((t, i) => [t.id, resp.data[i].embedding]));

  // Patch vector store — update matched entries in-place, preserving all other fields
  let updatedCount = 0;
  const patchedStore = store.map(entry => {
    const id = entry.id as string;
    if (newEmbeddings.has(id)) {
      updatedCount++;
      return {
        ...entry,
        title: kb.find(e => e.id === id)!.title,
        embedding: newEmbeddings.get(id)!,
      };
    }
    return entry;
  });

  if (updatedCount !== TARGET_IDS.length) {
    throw new Error(`Expected to patch ${TARGET_IDS.length} entries but only matched ${updatedCount}. ` +
      "Check that all TARGET_IDS exist in vector_store.json.");
  }

  fs.writeFileSync(STORE_PATH, JSON.stringify(patchedStore, null, 2));
  console.log(`\n[REEMBED] ✓ vector_store.json updated — ${updatedCount} entries re-embedded.`);
  console.log("[REEMBED] ⚠  Restart the API server to reload the new embeddings into memory.\n");
}

main().catch(e => { console.error(e); process.exit(1); });
