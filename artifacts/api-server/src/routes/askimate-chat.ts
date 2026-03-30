import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import {
  askimateConversations,
  askimateMessages,
  askimateWeeklyUsage,
  askimateUsers,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

interface AskimateUserPayload {
  id: number;
  email: string;
}

// Helper: Get or generate guest session ID
function getGuestSessionId(req: Request): string {
  const fromHeader = req.headers["x-guest-session-id"];
  if (typeof fromHeader === "string") {
    return fromHeader;
  }
  return randomUUID();
}

// Helper: Get current week (ISO format: YYYY-W##)
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

// POST /api/askimate/chat - Send message (guest or authenticated)
router.post("/askimate/chat", async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body as {
      message: string;
      conversationId?: number;
    };

    if (!message || message.trim().length === 0) {
      res.status(400).json({ error: "Message cannot be empty" });
      return;
    }

    const authHeader = req.headers.authorization;
    const isAuthenticated = authHeader && authHeader.startsWith("Bearer ");
    const token = isAuthenticated ? authHeader!.slice(7) : null;
    let userId: number | null = null;

    if (isAuthenticated && token) {
      // Verify token and get user
      try {
        const jwt = require("jsonwebtoken");
        const JWT_SECRET = process.env.JWT_SECRET || "askimate-jwt-secret-2026";
        const decoded = jwt.verify(token, JWT_SECRET) as AskimateUserPayload;
        userId = decoded.id;
      } catch {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
    }

    // Get or create conversation
    let conversation;
    const guestSessionId = !isAuthenticated ? getGuestSessionId(req) : null;

    if (conversationId) {
      // Use existing conversation
      conversation = await db.query.askimateConversations.findFirst({
        where: eq(askimateConversations.id, conversationId),
      });

      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
    } else {
      // Create new conversation
      const [newConversation] = await db
        .insert(askimateConversations)
        .values({
          userId: userId || null,
          guestSessionId: guestSessionId || null,
          isGuest: !isAuthenticated,
          questionCount: 0,
        })
        .returning();

      conversation = newConversation;
    }

    // Check limits
    if (!isAuthenticated) {
      // Guest limit: 2 questions
      if (conversation.questionCount >= 2) {
        res.status(429).json({
          error: "GUEST_LIMIT_REACHED",
          message: "To continue the conversation, please sign up",
          conversationId: conversation.id,
        });
        return;
      }
    } else if (userId) {
      // Free user limit: 5 questions per week
      const user = await db.query.askimateUsers.findFirst({
        where: eq(askimateUsers.id, userId),
      });

      if (user && user.plan === "free") {
        const currentWeek = getCurrentWeek();
        const usage = await db.query.askimateWeeklyUsage.findFirst({
          where: and(
            eq(askimateWeeklyUsage.userId, userId),
            eq(askimateWeeklyUsage.week, currentWeek)
          ),
        });

        const questionsUsed = usage?.questionsUsed || 0;

        if (questionsUsed >= 5) {
          res.status(429).json({
            error: "FREE_LIMIT_REACHED",
            message:
              "You've used all 5 free questions for this week. Upgrade to Premium Mentoring to continue. Start your 3-day free trial — cancel anytime.",
            conversationId: conversation.id,
            questionsUsed,
          });
          return;
        }
      }
    }

    // Save user message
    const [savedMessage] = await db
      .insert(askimateMessages)
      .values({
        conversationId: conversation.id,
        isUserMessage: true,
        content: message,
      })
      .returning();

    // Increment question count
    await db
      .update(askimateConversations)
      .set({
        questionCount: (conversation.questionCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(askimateConversations.id, conversation.id));

    // Track usage for free users
    if (userId) {
      const user = await db.query.askimateUsers.findFirst({
        where: eq(askimateUsers.id, userId),
      });

      if (user && user.plan === "free") {
        const currentWeek = getCurrentWeek();
        const existingUsage = await db.query.askimateWeeklyUsage.findFirst({
          where: and(
            eq(askimateWeeklyUsage.userId, userId),
            eq(askimateWeeklyUsage.week, currentWeek)
          ),
        });

        if (existingUsage) {
          await db
            .update(askimateWeeklyUsage)
            .set({
              questionsUsed: (existingUsage.questionsUsed || 0) + 1,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(askimateWeeklyUsage.userId, userId),
                eq(askimateWeeklyUsage.week, currentWeek)
              )
            );
        } else {
          await db.insert(askimateWeeklyUsage).values({
            userId,
            week: currentWeek,
            questionsUsed: 1,
          });
        }
      }
    }

    // Return response with guest session ID if guest
    res.json({
      success: true,
      message: savedMessage,
      conversation: {
        id: conversation.id,
        questionCount: conversation.questionCount + 1,
      },
      guestSessionId: guestSessionId || undefined,
    });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Chat error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/askimate/chat/:conversationId - Get conversation history
router.get("/askimate/chat/:conversationId", async (req: Request, res: Response) => {
  try {
    const conversationId = Number(req.params.conversationId);

    const conversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.id, conversationId),
    });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const messages = await db.query.askimateMessages.findMany({
      where: eq(askimateMessages.conversationId, conversationId),
    });

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /api/askimate/chat/migrate - Migrate guest conversation to user after login
router.post("/askimate/chat/migrate", async (req: Request, res: Response) => {
  try {
    const { guestSessionId } = req.body as { guestSessionId: string };
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "askimate-jwt-secret-2026";

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AskimateUserPayload;
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Find guest conversation
    const guestConversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.guestSessionId, guestSessionId),
    });

    if (!guestConversation) {
      // No guest conversation to migrate
      res.json({ message: "No guest conversation found to migrate" });
      return;
    }

    // Migrate: attach to user, mark as not guest
    await db
      .update(askimateConversations)
      .set({
        userId,
        isGuest: false,
        updatedAt: new Date(),
      })
      .where(eq(askimateConversations.id, guestConversation.id));

    res.json({
      success: true,
      conversation: {
        id: guestConversation.id,
        userId,
      },
    });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Migrate error:", error);
    res.status(500).json({ error: "Failed to migrate conversation" });
  }
});

export default router;
