import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import openai from "./openaiClient";
import type { VectorStoreEntry } from "./types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_PATH = path.join(__dirname, "vector_store.json");
const EMBEDDING_MODEL = "text-embedding-3-small";

let _store: VectorStoreEntry[] | null = null;

function loadStore(): VectorStoreEntry[] {
  if (_store) return _store;
  if (!fs.existsSync(STORE_PATH)) {
    throw new Error(
      "[RETRIEVAL] vector_store.json not found. Run the ingest script first."
    );
  }
  _store = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as VectorStoreEntry[];
  return _store;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface RetrievedEntry {
  id: string;
  title: string;
  risk_level: "low" | "medium" | "high";
  needs_human_review: boolean;
  answer: string;
  score: number;
}

export async function retrieveRelevantEntries(
  query: string,
  topK = 3
): Promise<RetrievedEntry[]> {
  const store = loadStore();

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: query,
  });

  const queryEmbedding = response.data[0].embedding;

  const scored = store.map((entry) => ({
    id: entry.id,
    title: entry.title,
    risk_level: entry.risk_level,
    needs_human_review: entry.needs_human_review,
    answer: entry.answer,
    score: cosineSimilarity(queryEmbedding, entry.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
