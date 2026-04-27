/**
 * Retrieval Audit — read-only diagnostic
 * Shows exact cosine similarity scores for 4 ambiguous queries
 * against every vector store entry, plus the embedded text for
 * the expected and actual top-ranked sources.
 *
 * Run:  pnpm --filter @workspace/api-server run retrieval-audit
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import type { KnowledgeBaseEntry } from "../src/ai/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AI_DIR    = path.join(__dirname, "../src/ai");
const STORE_PATH = path.join(AI_DIR, "vector_store.json");
const KB_PATH    = path.join(AI_DIR, "knowledge_base.json");

type VectorEntry = {
  id: string; title: string;
  risk_level: string; needs_human_review: boolean;
  answer: string; embedding: number[];
};

// ── Exact replica of buildEmbedText() in ingestApprovedKb.ts ────────────────
function buildEmbedText(entry: KnowledgeBaseEntry): string {
  return [entry.title, ...entry.sample_questions].join("\n");
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return na === 0 || nb === 0 ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
}

const CASES = [
  { query: "What makes the UK attractive?",
    expectedId: "about_uk",       wrongId: "why_uk",
    q: "q02" },
  { query: "Are there affordable UK universities?",
    expectedId: "tuition_fees",   wrongId: "uk_universities",
    q: "q11" },
  { query: "Can my dependants join me while I study in the UK?",
    expectedId: "uk_student_visa", wrongId: "uk_student_jobs",
    q: "q19" },
  { query: "What is student life like at a UK university?",
    expectedId: "uk_student_life", wrongId: "about_uk",
    q: "q25" },
];

async function main() {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const store: VectorEntry[] = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
  const kb: KnowledgeBaseEntry[] = JSON.parse(fs.readFileSync(KB_PATH, "utf-8"));
  const kbById = Object.fromEntries(kb.map(e => [e.id, e]));

  // Attach the embedded text to each store entry
  const enriched = store.map(e => ({
    ...e,
    embeddedText: kbById[e.id] ? buildEmbedText(kbById[e.id]) : "(missing in KB)",
  }));

  for (const c of CASES) {
    console.log("\n" + "═".repeat(80));
    console.log(`[${c.q}] QUERY: "${c.query}"`);
    console.log("═".repeat(80));

    const resp = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: c.query,
    });
    const qEmb = resp.data[0].embedding;

    const scored = enriched
      .map(e => ({ id: e.id, title: e.title, score: cosine(qEmb, e.embedding) }))
      .sort((a, b) => b.score - a.score);

    const expScore   = scored.find(e => e.id === c.expectedId)?.score ?? 0;
    const wrongScore = scored.find(e => e.id === c.wrongId)?.score ?? 0;
    const gap = wrongScore - expScore;

    console.log("\n  TOP 5 ENTRIES BY COSINE SIMILARITY:");
    scored.slice(0, 7).forEach((e, i) => {
      let tag = "";
      if (e.id === c.expectedId) tag = "  ← EXPECTED";
      else if (e.id === c.wrongId) tag = "  ← CHOSE THIS (wrong)";
      console.log(`  ${String(i+1).padStart(2)}. ${e.id.padEnd(36)} ${e.score.toFixed(6)}${tag}`);
    });

    console.log(`\n  SCORE GAP: wrong=${wrongScore.toFixed(6)}  expected=${expScore.toFixed(6)}`);
    console.log(`             Δ = ${gap.toFixed(6)} (${gap > 0 ? "wrong leads" : "expected leads"} by ${Math.abs(gap * 100).toFixed(3)}pp)`);

    const wrongEntry    = enriched.find(e => e.id === c.wrongId)!;
    const expectedEntry = enriched.find(e => e.id === c.expectedId)!;

    console.log(`\n  ── EMBEDDED TEXT: WRONG (${c.wrongId}) ────────────────────────────────`);
    wrongEntry.embeddedText.split("\n").forEach(l => console.log(`    ${l}`));

    console.log(`\n  ── EMBEDDED TEXT: EXPECTED (${c.expectedId}) ───────────────────────────`);
    expectedEntry.embeddedText.split("\n").forEach(l => console.log(`    ${l}`));
  }

  console.log("\n" + "═".repeat(80));
  console.log("AUDIT COMPLETE — no files were modified");
  console.log("═".repeat(80));
}

main().catch(e => { console.error(e); process.exit(1); });
