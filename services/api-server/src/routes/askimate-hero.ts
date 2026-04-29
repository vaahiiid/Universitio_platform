import { Router, type IRouter, type Request, type Response } from "express";
import { createHash } from "node:crypto";
import { generateAiAnswer } from "../ai/chatService";
import { db, heroAnalytics } from "@workspace/db";

const router: IRouter = Router();

const HERO_WINDOW_MS = 15 * 60 * 1000;
const HERO_MAX_PER_WINDOW = 3;

interface IpEntry {
  count: number;
  windowStart: number;
}

const ipMap = new Map<string, IpEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now - entry.windowStart >= HERO_WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= HERO_MAX_PER_WINDOW) {
    return true;
  }
  entry.count += 1;
  return false;
}

setInterval(() => {
  const cutoff = Date.now() - HERO_WINDOW_MS;
  for (const [key, val] of ipMap) {
    if (val.windowStart < cutoff) ipMap.delete(key);
  }
}, HERO_WINDOW_MS);

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

async function logHeroEvent(
  ipHash: string,
  question: string | null,
  outcome: string,
  needsHumanReview?: boolean,
): Promise<void> {
  try {
    await db.insert(heroAnalytics).values({
      ipHash,
      question: question ?? undefined,
      outcome,
      needsHumanReview: needsHumanReview ?? undefined,
    });
  } catch (err) {
    console.error("[HERO-ANALYTICS] Failed to log event:", err);
  }
}

/**
 * POST /api/askimate/hero-ask
 * Guest-accessible endpoint for the homepage hero chat demo.
 * Limited to HERO_MAX_PER_WINDOW requests per IP per window — no auth required.
 * Body: { message: string }
 * Response: { answer: string, needsHumanReview: boolean }
 */
router.post("/askimate/hero-ask", async (req: Request, res: Response) => {
  const ip = (req.ip ?? req.socket.remoteAddress ?? "unknown").replace(/^::ffff:/, "");
  const ipHash = hashIp(ip);

  // Parse message BEFORE rate-limit check so we can log the attempted question
  const { message } = req.body as { message?: string };

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  if (message.trim().length > 500) {
    res.status(400).json({ error: "Message too long (max 500 characters)" });
    return;
  }

  const question = message.trim();

  if (isRateLimited(ip)) {
    void logHeroEvent(ipHash, question, "rate_limited");
    res.status(429).json({
      error: "RATE_LIMITED",
      message: "You've used your demo questions. Sign up for AskiMate to keep chatting.",
    });
    return;
  }

  try {
    const result = await generateAiAnswer(question, []);
    void logHeroEvent(ipHash, question, "answered", result.needsHumanReview);
    res.json({
      answer: result.answer,
      needsHumanReview: result.needsHumanReview,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[HERO-ASK] Error:", msg);
    void logHeroEvent(ipHash, question, "error");

    if (msg.includes("vector_store.json not found")) {
      res.status(503).json({ error: "AI knowledge base is warming up. Please try again shortly." });
      return;
    }
    if (msg.includes("OPENAI_API_KEY")) {
      res.status(503).json({ error: "AI service unavailable. Please try again later." });
      return;
    }
    res.status(500).json({ error: "Failed to generate a response. Please try again." });
  }
});

/**
 * POST /api/askimate/hero-ctr
 * Tracks when a visitor clicks "Continue the conversation in AskiMate"
 * after receiving an answer in the hero demo.
 * Body: {} (empty — IP is all we need)
 * Response: { ok: true }
 */
router.post("/askimate/hero-ctr", (req: Request, res: Response) => {
  const ip = (req.ip ?? req.socket.remoteAddress ?? "unknown").replace(/^::ffff:/, "");
  void logHeroEvent(hashIp(ip), null, "ctr_click");
  res.json({ ok: true });
});

export default router;
