import { Router, type IRouter, type Request, type Response } from "express";
import { generateAiAnswer, type AiChatMessage } from "../ai/chatService";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "askimate-jwt-secret-2026";

interface AskimateUserPayload {
  id: number;
  email: string;
  emailVerified?: boolean;
}

function tryGetUser(req: Request): AskimateUserPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token) return null;
  try {
    const jwt = require("jsonwebtoken");
    return jwt.verify(token, JWT_SECRET) as AskimateUserPayload;
  } catch {
    return null;
  }
}

/**
 * POST /api/askimate/ai
 * AI knowledge-base Q&A powered by OpenAI embeddings + gpt-4o-mini.
 * Open to guests and authenticated users.
 * Authenticated users must have a verified email.
 *
 * Body: { message: string, history?: { role: "user"|"assistant", content: string }[] }
 * Response: { answer: string, sources: [...], needsHumanReview: boolean }
 */
router.post("/askimate/ai", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: AiChatMessage[];
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (message.trim().length > 2000) {
      res.status(400).json({ error: "Message is too long (max 2000 characters)" });
      return;
    }

    const user = tryGetUser(req);

    if (user) {
      if (user.emailVerified === false) {
        res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
        return;
      }
    }

    const safeHistory: AiChatMessage[] = Array.isArray(history)
      ? history
          .filter(
            (h) =>
              h &&
              (h.role === "user" || h.role === "assistant") &&
              typeof h.content === "string"
          )
          .slice(-10)
      : [];

    const result = await generateAiAnswer(message.trim(), safeHistory);

    res.json({
      answer: result.answer,
      sources: result.sources,
      needsHumanReview: result.needsHumanReview,
      mode: result.mode,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[ASKIMATE-AI] Error:", message);

    if (message.includes("vector_store.json not found")) {
      res.status(503).json({
        error: "AI knowledge base is not ready yet. Please try again shortly.",
      });
      return;
    }

    if (message.includes("OPENAI_API_KEY")) {
      res.status(503).json({
        error: "AI service is not configured. Please contact support.",
      });
      return;
    }

    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

export default router;
