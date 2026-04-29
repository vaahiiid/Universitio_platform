import { Router, type IRouter, type Request, type Response } from "express";
import { createHash } from "node:crypto";
import { generateAiAnswer } from "../ai/chatService";
import { db, heroAnalytics, pool } from "@workspace/db";

const router: IRouter = Router();

const HERO_WINDOW_MS = 15 * 60 * 1000;
const HERO_MAX_PER_WINDOW = 3;

/**
 * Atomically increments the request counter for the given IP hash and returns
 * the resulting count within the current window.
 *
 * A single SQL upsert handles all cases without a separate SELECT:
 *   - New IP or expired window  → inserts/resets the row, returns 1
 *   - Within window             → increments and returns the new count
 *
 * If the returned count exceeds HERO_MAX_PER_WINDOW the caller should reject
 * the request.  Throws on any database error (caller must fail-closed).
 */
async function incrementAndGetCount(ipHash: string): Promise<number> {
  const now = Date.now();
  const cutoff = now - HERO_WINDOW_MS;

  const { rows } = await pool.query<{ count: number }>(
    `INSERT INTO hero_rate_limit (ip_hash, count, window_start)
     VALUES ($1, 1, $2)
     ON CONFLICT (ip_hash) DO UPDATE
       SET count        = CASE
                            WHEN hero_rate_limit.window_start < $3 THEN 1
                            ELSE hero_rate_limit.count + 1
                          END,
           window_start = CASE
                            WHEN hero_rate_limit.window_start < $3 THEN $2
                            ELSE hero_rate_limit.window_start
                          END
     RETURNING count`,
    [ipHash, now, cutoff],
  );

  return rows[0].count;
}

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
 * Rate-limit counters are stored in the database and survive server restarts.
 * The counter is incremented atomically via a single SQL upsert so concurrent
 * requests from the same IP cannot race past the cap.
 * Body: { message: string }
 * Response: { answer: string, needsHumanReview: boolean }
 */
router.post("/askimate/hero-ask", async (req: Request, res: Response) => {
  const ip = (req.ip ?? req.socket.remoteAddress ?? "unknown").replace(/^::ffff:/, "");
  const ipHash = hashIp(ip);

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

  let count: number;
  try {
    count = await incrementAndGetCount(ipHash);
  } catch (err) {
    console.error("[HERO-ASK] Rate-limit DB error:", err);
    void logHeroEvent(ipHash, question, "error");
    res.status(503).json({ error: "Service temporarily unavailable. Please try again shortly." });
    return;
  }

  if (count > HERO_MAX_PER_WINDOW) {
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
