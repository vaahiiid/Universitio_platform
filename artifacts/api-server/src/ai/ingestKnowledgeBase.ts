/**
 * Run once to generate vector_store.json from knowledge_base.json.
 * Usage: npx ts-node -e "require('./src/ai/ingestKnowledgeBase')"
 * Or: node -r ts-node/register src/ai/ingestKnowledgeBase.ts
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import openai from "./openaiClient";
import type { KnowledgeBaseEntry, VectorStoreEntry } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, "knowledge_base.json");
const STORE_PATH = path.join(__dirname, "vector_store.json");
const EMBEDDING_MODEL = "text-embedding-3-small";
const BATCH_SIZE = 10;

function buildTextToEmbed(entry: KnowledgeBaseEntry): string {
  return [entry.title, ...entry.sample_questions].join("\n");
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

async function ingest(): Promise<void> {
  console.log("[INGEST] Reading knowledge base...");
  const raw = fs.readFileSync(KB_PATH, "utf-8");
  const entries: KnowledgeBaseEntry[] = JSON.parse(raw);
  console.log(`[INGEST] ${entries.length} entries found`);

  const results: VectorStoreEntry[] = [];

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const texts = batch.map(buildTextToEmbed);

    console.log(
      `[INGEST] Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(entries.length / BATCH_SIZE)} (${batch.length} items)...`
    );

    const embeddings = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const entry = batch[j];
      results.push({
        id: entry.id,
        title: entry.title,
        risk_level: entry.risk_level,
        needs_human_review: entry.needs_human_review,
        answer: entry.answer_variants[0] ?? "",
        embedding: embeddings[j],
      });
    }
  }

  fs.writeFileSync(STORE_PATH, JSON.stringify(results, null, 2));
  console.log(`[INGEST] vector_store.json written with ${results.length} entries`);
}

ingest().catch((err) => {
  console.error("[INGEST] Failed:", err);
  process.exit(1);
});
