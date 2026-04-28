import { Router, type IRouter, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import {
  askimateUsers,
  askimateWeeklyUsage,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { generateAiAnswer, type AiChatMessage } from "../ai/chatService";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "askimate-jwt-secret-2026";

// In-memory burst guard (secondary, fast layer) — not a substitute for plan enforcement
const BURST_WINDOW_MS = 10 * 1000;
const BURST_MAX_REQUESTS = 5;
const HISTORY_ENTRY_MAX_CHARS = 500;
const FREE_WEEKLY_LIMIT = 5;

interface AskimateUserPayload {
  id: number;
  email: string;
  emailVerified?: boolean;
}

interface BurstEntry {
  count: number;
  windowStart: number;
}

const burstMap = new Map<number, BurstEntry>();

function isBurstLimited(userId: number): boolean {
  const now = Date.now();
  const entry = burstMap.get(userId);
  if (!entry || now - entry.windowStart >= BURST_WINDOW_MS) {
    burstMap.set(userId, { count: 1, windowStart: now });
    return false;
  }
  if (entry.count >= BURST_MAX_REQUESTS) {
    return true;
  }
  entry.count += 1;
  return false;
}

function getUser(req: Request): AskimateUserPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as AskimateUserPayload;
  } catch {
    return null;
  }
}

function getCurrentWeek(): string {
  const now = new Date();
  const start = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  const year = start.getFullYear();
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/**
 * POST /api/askimate/ai
 * AI knowledge-base Q&A powered by OpenAI embeddings + gpt-4o-mini.
 * Requires a valid authenticated session.
 * Authenticated users must have a verified email.
 * Free users are subject to the same 5 questions/week cap as the main chat route.
 * Premium users (active plan) have unlimited access.
 *
 * Body: { message: string, history?: { role: "user"|"assistant", content: string }[] }
 * Response: { answer: string, sources: [...], needsHumanReview: boolean }
 */
router.post("/askimate/ai", async (req: Request, res: Response) => {
  try {
    const user = getUser(req);

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (user.emailVerified === false) {
      res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
      return;
    }

    // Fast burst guard (in-memory, per-process) — catches rapid-fire requests
    if (isBurstLimited(user.id)) {
      res.status(429).json({ error: "Too many requests. Please wait a moment before trying again." });
      return;
    }

    // DB-backed plan/usage enforcement — persistent and cluster-safe
    const dbUser = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, user.id),
    });

    if (dbUser && !dbUser.emailVerified) {
      res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
      return;
    }

    const now = new Date();
    const planExpiresAt = dbUser?.trialEndsAt ? new Date(dbUser.trialEndsAt) : null;
    const isActivePremium = dbUser?.plan === "premium" && planExpiresAt && planExpiresAt > now;

    if (dbUser && !isActivePremium) {
      const currentWeek = getCurrentWeek();
      const usage = await db.query.askimateWeeklyUsage.findFirst({
        where: and(
          eq(askimateWeeklyUsage.userId, user.id),
          eq(askimateWeeklyUsage.week, currentWeek)
        ),
      });

      const questionsUsed = usage?.questionsUsed || 0;

      if (questionsUsed >= FREE_WEEKLY_LIMIT) {
        res.status(429).json({
          error: "FREE_LIMIT_REACHED",
          message: "You've used all 5 free questions for this week. Upgrade to Premium Mentoring for unlimited access.",
          questionsUsed,
          planExpired: dbUser.plan === "premium" && !!planExpiresAt,
        });
        return;
      }
    }

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

    const safeHistory: AiChatMessage[] = Array.isArray(history)
      ? history
          .filter(
            (h) =>
              h &&
              (h.role === "user" || h.role === "assistant") &&
              typeof h.content === "string"
          )
          .slice(-10)
          .map((h) => ({
            role: h.role,
            content: h.content.slice(0, HISTORY_ENTRY_MAX_CHARS),
          }))
      : [];

    const result = await generateAiAnswer(message.trim(), safeHistory);

    // Track weekly usage for non-premium users (fire-and-forget, mirrors chat route)
    if (dbUser && !isActivePremium) {
      const currentWeek = getCurrentWeek();
      const existingUsage = await db.query.askimateWeeklyUsage.findFirst({
        where: and(
          eq(askimateWeeklyUsage.userId, user.id),
          eq(askimateWeeklyUsage.week, currentWeek)
        ),
      });

      if (existingUsage) {
        db.update(askimateWeeklyUsage)
          .set({ questionsUsed: (existingUsage.questionsUsed || 0) + 1, updatedAt: new Date() })
          .where(and(eq(askimateWeeklyUsage.userId, user.id), eq(askimateWeeklyUsage.week, currentWeek)))
          .catch((err: unknown) => console.error("[ASKIMATE-AI] Failed to update weekly usage:", err));
      } else {
        db.insert(askimateWeeklyUsage)
          .values({ userId: user.id, week: currentWeek, questionsUsed: 1 })
          .catch((err: unknown) => console.error("[ASKIMATE-AI] Failed to insert weekly usage:", err));
      }
    }

    res.json({
      answer: result.answer,
      sources: result.sources,
      reviewLevel: result.reviewLevel,
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
