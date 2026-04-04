import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { retrieveByKeyword } from "./keywordRetrieval";
import type { KeywordRetrievedEntry } from "./keywordRetrieval";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VECTOR_STORE_PATH = path.join(__dirname, "vector_store.json");
const EMBEDDING_MODEL = "text-embedding-3-small";
const CHAT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are AskiMate, an AI assistant for Universitio — a UK education consultancy (Company No. 15168670).

Your role is to answer questions about studying in the UK, including universities, colleges, schools, visas, costs, requirements, and student life, using the knowledge provided to you.

Guidelines:
- Be warm, helpful, and conversational — you are supporting prospective international students.
- Use the provided knowledge base context to answer accurately. Do not invent facts.
- If the context does not fully cover the question, say what you do know and recommend the user speak with a Universitio mentor for personalised guidance.
- For high-risk topics (visas, bank statements, legal requirements), always add: "For your specific situation, we strongly recommend speaking with one of our expert mentors."
- Keep answers concise and well-structured. Use bullet points or numbered lists where helpful.
- Do not mention that you are using a knowledge base or any technical implementation details.
- Refer to Universitio naturally as "we" or "our team" when appropriate.`;

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type ReviewLevel = "safe_auto" | "cautious_auto" | "escalate_human";

export interface AiChatResult {
  answer: string;
  sources: { id: string; title: string; score: number }[];
  needsHumanReview: boolean;
  reviewLevel: ReviewLevel;
  mode: "openai_semantic" | "bm25_fallback";
}

const ESCALATE_KEYWORDS = [
  /\bvisa\b/i,
  /\bimmigration\b/i,
  /bank\s+statement/i,
  /proof\s+of\s+funds/i,
  /\bdepend(a|e)nt(s)?\b/i,
  /\bcas\b/i,
  /\batas\b/i,
];

const SEMANTIC_LOW_CONFIDENCE = 0.20;
const BM25_LOW_CONFIDENCE = 0.15;

function computeReviewLevel(
  query: string,
  entries: RetrievedEntry[],
  retrievalMode: "openai_semantic" | "bm25_fallback"
): ReviewLevel {
  if (ESCALATE_KEYWORDS.some((re) => re.test(query))) return "escalate_human";

  const topScore = entries[0]?.score ?? 0;
  const confidenceThreshold =
    retrievalMode === "openai_semantic" ? SEMANTIC_LOW_CONFIDENCE : BM25_LOW_CONFIDENCE;
  if (topScore < confidenceThreshold) return "escalate_human";

  const maxRisk = entries.reduce<"low" | "medium" | "high">((worst, e) => {
    if (e.risk_level === "high") return "high";
    if (e.risk_level === "medium" && worst !== "high") return "medium";
    return worst;
  }, "low");

  const anyNeedsReview = entries.some((e) => e.needs_human_review);

  if (maxRisk === "high") return "escalate_human";
  if (maxRisk === "medium" || anyNeedsReview) return "cautious_auto";
  return "safe_auto";
}

interface RetrievedEntry {
  id: string;
  title: string;
  risk_level: "low" | "medium" | "high";
  needs_human_review: boolean;
  answer: string;
  score: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function trySemanticRetrieval(query: string, topK: number): Promise<RetrievedEntry[] | null> {
  try {
    if (!fs.existsSync(VECTOR_STORE_PATH)) return null;

    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const embResp = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query,
    });

    const queryEmbedding = embResp.data[0].embedding;
    const store = JSON.parse(fs.readFileSync(VECTOR_STORE_PATH, "utf-8")) as Array<{
      id: string; title: string; risk_level: "low" | "medium" | "high";
      needs_human_review: boolean; answer: string; embedding: number[];
    }>;

    const scored = store
      .map((e) => ({
        id: e.id,
        title: e.title,
        risk_level: e.risk_level,
        needs_human_review: e.needs_human_review,
        answer: e.answer,
        score: cosineSimilarity(queryEmbedding, e.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored;
  } catch {
    return null;
  }
}

const REVIEW_LEVEL_INSTRUCTIONS: Record<ReviewLevel, string> = {
  safe_auto: "",
  cautious_auto:
    "Note: Requirements and details may vary between institutions and change over time. " +
    "Always encourage the user to verify specifics with the relevant university or college.",
  escalate_human:
    "This is a high-stakes topic. After your answer, always include this exact sentence on its own line: " +
    '"For your specific situation, we strongly recommend speaking with one of our expert mentors."',
};

async function tryOpenAiChat(
  userMessage: string,
  entries: RetrievedEntry[],
  history: AiChatMessage[],
  reviewLevel: ReviewLevel
): Promise<string | null> {
  try {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const contextBlock =
      entries.length > 0
        ? "Relevant knowledge base information:\n\n" +
          entries.map((e, i) => `[${i + 1}] Topic: ${e.title}\n${e.answer}`).join("\n\n---\n\n")
        : "";

    const levelInstruction = REVIEW_LEVEL_INSTRUCTIONS[reviewLevel];
    const systemContent = levelInstruction
      ? `${SYSTEM_PROMPT}\n\nAdditional instruction: ${levelInstruction}`
      : SYSTEM_PROMPT;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemContent },
    ];
    if (contextBlock) messages.push({ role: "system", content: contextBlock });
    for (const h of history.slice(-6)) messages.push({ role: h.role, content: h.content });
    messages.push({ role: "user", content: userMessage });

    const completion = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      max_tokens: 800,
      temperature: 0.4,
    });

    return completion.choices[0]?.message?.content ?? null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[ASKIMATE-AI] gpt-4o-mini unavailable, using direct KB answer:", msg.slice(0, 80));
    return null;
  }
}

function buildDirectAnswer(entries: RetrievedEntry[]): string {
  if (entries.length === 0) {
    return (
      "I don't have specific information about that in my knowledge base right now. " +
      "For personalised guidance, please speak with one of our Universitio mentors."
    );
  }
  const top = entries[0];
  const highRisk = entries.some((e) => e.risk_level === "high" || e.needs_human_review);
  return top.answer + (highRisk
    ? "\n\nFor your specific situation, we strongly recommend speaking with one of our expert mentors."
    : "");
}

export async function generateAiAnswer(
  userMessage: string,
  history: AiChatMessage[] = []
): Promise<AiChatResult> {
  let entries: RetrievedEntry[];
  let retrievalMode: "openai_semantic" | "bm25_fallback";

  const semanticEntries = await trySemanticRetrieval(userMessage, 3);

  if (semanticEntries && semanticEntries.length > 0) {
    entries = semanticEntries;
    retrievalMode = "openai_semantic";
  } else {
    const kw = retrieveByKeyword(userMessage, 3, 0.001) as KeywordRetrievedEntry[];
    entries = kw.map((e) => ({
      id: e.id,
      title: e.title,
      risk_level: e.risk_level,
      needs_human_review: e.needs_human_review,
      answer: e.answer,
      score: e.score,
    }));
    retrievalMode = "bm25_fallback";
  }

  const reviewLevel = computeReviewLevel(userMessage, entries, retrievalMode);
  const needsHumanReview = reviewLevel === "escalate_human";

  const sources = entries.map((e) => ({
    id: e.id,
    title: e.title,
    score: Math.round(e.score * 100) / 100,
  }));

  if (retrievalMode === "openai_semantic") {
    const aiAnswer = await tryOpenAiChat(userMessage, entries, history, reviewLevel);
    if (aiAnswer) {
      return { answer: aiAnswer, sources, needsHumanReview, reviewLevel, mode: "openai_semantic" };
    }
  }

  const directAnswer = buildDirectAnswer(entries);
  return { answer: directAnswer, sources, needsHumanReview, reviewLevel, mode: "bm25_fallback" };
}
