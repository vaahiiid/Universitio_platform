import openai from "./openaiClient";
import { retrieveRelevantEntries, type RetrievedEntry } from "./retrieval";

const CHAT_MODEL = "gpt-4o-mini";
const MIN_SCORE_THRESHOLD = 0.3;

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

function buildContextBlock(entries: RetrievedEntry[]): string {
  if (entries.length === 0) return "";

  const relevant = entries.filter((e) => e.score >= MIN_SCORE_THRESHOLD);
  if (relevant.length === 0) return "";

  return (
    "Relevant knowledge base information:\n\n" +
    relevant
      .map(
        (e, i) =>
          `[${i + 1}] Topic: ${e.title}\n${e.answer}`
      )
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
}

export async function generateAiAnswer(
  userMessage: string,
  history: AiChatMessage[] = []
): Promise<AiChatResult> {
  const entries = await retrieveRelevantEntries(userMessage, 3);

  const contextBlock = buildContextBlock(entries);
  const needsHumanReview = entries.some(
    (e) => e.needs_human_review && e.score >= MIN_SCORE_THRESHOLD
  );

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (contextBlock) {
    messages.push({
      role: "system",
      content: contextBlock,
    });
  }

  for (const h of history.slice(-6)) {
    messages.push({ role: h.role, content: h.content });
  }

  messages.push({ role: "user", content: userMessage });

  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    max_tokens: 800,
    temperature: 0.4,
  });

  const answer = completion.choices[0]?.message?.content ?? "I'm sorry, I could not generate a response. Please try again.";

  const sources = entries
    .filter((e) => e.score >= MIN_SCORE_THRESHOLD)
    .map((e) => ({ id: e.id, title: e.title, score: Math.round(e.score * 100) / 100 }));

  return { answer, sources, needsHumanReview };
}
