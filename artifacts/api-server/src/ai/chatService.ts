import { retrieveByKeyword } from "./keywordRetrieval";
import type { KeywordRetrievedEntry } from "./keywordRetrieval";

const CHAT_MODEL = "gpt-4o-mini";
const MIN_SCORE_THRESHOLD = 0.05;

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

function buildContextBlock(entries: KeywordRetrievedEntry[]): string {
  if (entries.length === 0) return "";
  return (
    "Relevant knowledge base information:\n\n" +
    entries
      .map((e, i) => `[${i + 1}] Topic: ${e.title}\n${e.answer}`)
      .join("\n\n---\n\n")
  );
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatResult {
  answer: string;
  sources: { id: string; title: string; score: number }[];
  needsHumanReview: boolean;
  mode: "ai" | "direct";
}

async function tryOpenAiAnswer(
  userMessage: string,
  entries: KeywordRetrievedEntry[],
  history: AiChatMessage[]
): Promise<string | null> {
  try {
    const openai = (await import("./openaiClient")).default;
    const contextBlock = buildContextBlock(entries);

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (contextBlock) {
      messages.push({ role: "system", content: contextBlock });
    }

    for (const h of history.slice(-6)) {
      messages.push({ role: h.role, content: h.content });
    }

    messages.push({ role: "user", content: userMessage });

    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: CHAT_MODEL,
      messages,
      max_tokens: 800,
      temperature: 0.4,
    });

    return completion.choices[0]?.message?.content ?? null;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[ASKIMATE-AI] OpenAI unavailable, using direct KB answer:", msg.slice(0, 80));
    return null;
  }
}

function buildDirectAnswer(entries: KeywordRetrievedEntry[]): string {
  if (entries.length === 0) {
    return (
      "I don't have specific information about that in my knowledge base. " +
      "For personalised guidance, please speak with one of our Universitio mentors who can help you directly."
    );
  }

  const top = entries[0];
  const hasHighRisk = entries.some((e) => e.risk_level === "high" || e.needs_human_review);

  let answer = top.answer;

  if (hasHighRisk) {
    answer +=
      "\n\nFor your specific situation, we strongly recommend speaking with one of our expert mentors.";
  }

  return answer;
}

export async function generateAiAnswer(
  userMessage: string,
  history: AiChatMessage[] = []
): Promise<AiChatResult> {
  const entries = retrieveByKeyword(userMessage, 3, MIN_SCORE_THRESHOLD);

  const needsHumanReview = entries.some(
    (e) => e.needs_human_review || e.risk_level === "high"
  );

  const sources = entries.map((e) => ({
    id: e.id,
    title: e.title,
    score: Math.round(e.score * 100) / 100,
  }));

  const aiAnswer = await tryOpenAiAnswer(userMessage, entries, history);

  if (aiAnswer) {
    return { answer: aiAnswer, sources, needsHumanReview, mode: "ai" };
  }

  return {
    answer: buildDirectAnswer(entries),
    sources,
    needsHumanReview,
    mode: "direct",
  };
}
