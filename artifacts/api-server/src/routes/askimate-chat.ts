import { Router, type IRouter, type Request, type Response } from "express";
import { randomUUID } from "crypto";
import { db } from "@workspace/db";
import {
  askimateConversations,
  askimateMessages,
  askimateWeeklyUsage,
  askimateUsers,
} from "@workspace/db/schema";
import { eq, and, ne, desc, count } from "drizzle-orm";
import { sendTransactionalEmail, EmailType } from "../email/transactionalEmailService";
import { generateAiAnswer } from "../ai/chatService";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "askimate-jwt-secret-2026";
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

      // CRITICAL: Verify authenticated user owns this conversation
      if (isAuthenticated && conversation.userId !== userId) {
        res.status(403).json({ error: "Unauthorised" });
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

    // Check if conversation is closed
    if (conversation.status === "closed") {
      res.status(403).json({
        error: "CONVERSATION_CLOSED",
        message: "This conversation is closed. Contact support to reopen.",
      });
      return;
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
      // Fetch user to determine effective plan (premium only counts if not expired)
      const user = await db.query.askimateUsers.findFirst({
        where: eq(askimateUsers.id, userId),
      });

      // ── Email verification gate ───────────────────────────────────────────
      // Login is not blocked, but chat is gated behind a verified email address.
      // The frontend detects EMAIL_NOT_VERIFIED and prompts the user to check their inbox.
      if (user && !user.emailVerified) {
        res.status(403).json({
          error: "EMAIL_NOT_VERIFIED",
          message: "Please verify your email address before using the chat. Check your inbox for the verification link.",
        });
        return;
      }
      // ─────────────────────────────────────────────────────────────────────

      const now = new Date();
      const planExpiresAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
      const isActivePremium = user?.plan === "premium" && planExpiresAt && planExpiresAt > now;

      // Treat as free if: explicitly free, or premium with an expired plan
      if (user && !isActivePremium) {
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
              "You've used all 5 free questions for this week. Upgrade to Premium Mentoring for unlimited access.",
            conversationId: conversation.id,
            questionsUsed,
            planExpired: user.plan === "premium" && !!planExpiresAt,
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
        sender: "user",
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

    // Track usage for non-premium users (free, or premium with expired plan)
    if (userId) {
      const user = await db.query.askimateUsers.findFirst({
        where: eq(askimateUsers.id, userId),
      });

      const now2 = new Date();
      const planExp = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
      const isActivePremium2 = user?.plan === "premium" && planExp && planExp > now2;

      if (user && !isActivePremium2) {
        const currentWeek = getCurrentWeek();
        const existingUsage = await db.query.askimateWeeklyUsage.findFirst({
          where: and(
            eq(askimateWeeklyUsage.userId, userId),
            eq(askimateWeeklyUsage.week, currentWeek)
          ),
        });

        const newCount = existingUsage
          ? (existingUsage.questionsUsed || 0) + 1
          : 1;

        if (existingUsage) {
          await db
            .update(askimateWeeklyUsage)
            .set({
              questionsUsed: newCount,
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
            questionsUsed: newCount,
          });
        }

        // Send usage limit email only at the exact moment the 5th question is consumed
        // (newCount === 5 means this was the last allowed question — naturally idempotent)
        if (newCount === 5) {
          sendTransactionalEmail(EmailType.USAGE_LIMIT_REACHED, user.email, {
            firstName: user.firstName,
            planName: "Free",
            limitDescription: "5 free questions this week",
          }).catch((err) => console.error("[EMAIL] Usage limit email failed:", err));
        }
      }

      // Record authenticated activity for re-engagement tracking (fire-and-forget)
      db.update(askimateUsers)
        .set({ lastActiveAt: new Date(), updatedAt: new Date() })
        .where(eq(askimateUsers.id, userId))
        .catch((err) => console.error("[ACTIVITY] Failed to update lastActiveAt on chat:", err));
    }

    // AI KB response: if no mentor/ai reply within the last 5 minutes, generate one now.
    // Always calls the AI KB so admin can see review level + sources as context.
    const lastNonUserMsg = await db.query.askimateMessages.findFirst({
      where: and(
        eq(askimateMessages.conversationId, conversation.id),
        ne(askimateMessages.sender, "user")
      ),
      orderBy: desc(askimateMessages.createdAt),
    });
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Captured and returned in the response so clients need only one call
    let aiResponseData: {
      answer: string;
      reviewLevel: string;
      needsHumanReview: boolean;
      sources: { id: string; title: string; score: number }[];
      mode: string;
    } | null = null;

    if (!lastNonUserMsg || (lastNonUserMsg.createdAt && new Date(lastNonUserMsg.createdAt) < fiveMinAgo)) {
      try {
        const aiResult = await generateAiAnswer(message);

        // Always show the AI answer to the user. For escalate_human the GPT system prompt
        // already ends the answer with a mentor-recommendation sentence. The mentor/admin
        // handoff still happens in parallel via the metadata reviewLevel signal.
        const displayContent = aiResult.answer;

        const aiMeta = {
          reviewLevel: aiResult.reviewLevel,
          needsHumanReview: aiResult.needsHumanReview,
          sources: aiResult.sources ?? [],
          aiAttempt: aiResult.answer,
        };

        await db.insert(askimateMessages).values({
          conversationId: conversation.id,
          isUserMessage: false,
          sender: "ai",
          content: displayContent,
          metadata: aiMeta,
        });

        aiResponseData = {
          answer: displayContent,
          reviewLevel: aiResult.reviewLevel,
          needsHumanReview: aiResult.needsHumanReview,
          sources: (aiResult.sources ?? []) as { id: string; title: string; score: number }[],
          mode: aiResult.mode ?? "openai_semantic",
        };

        // Persistent structured server-side log for all AI interactions
        const sessionType = guestSessionId ? "guest" : "user";
        const sourceIds = (aiResult.sources ?? []).map((s: { id: string }) => s.id).join(",") || "none";
        console.log(
          `[AITL] AI_RESPONSE conversationId=${conversation.id} sessionType=${sessionType} ` +
          `reviewLevel=${aiResult.reviewLevel} needsHumanReview=${aiResult.needsHumanReview} ` +
          `mode=${aiResult.mode ?? "openai_semantic"} sources=${sourceIds} ` +
          `question="${message.slice(0, 100)}"`
        );
      } catch (aiErr) {
        console.error("[AITL] AI KB call failed, falling back to generic ack:", aiErr);
        await db.insert(askimateMessages).values({
          conversationId: conversation.id,
          isUserMessage: false,
          sender: "ai",
          content: "Thank you for your message. We've received it and will get back to you shortly.",
        });
      }
    }

    // Return response — aiResponse included so guests only need one round-trip
    res.json({
      success: true,
      message: savedMessage,
      conversation: {
        id: conversation.id,
        questionCount: conversation.questionCount + 1,
      },
      guestSessionId: guestSessionId || undefined,
      aiResponse: aiResponseData ?? undefined,
    });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Chat error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/askimate/chat/:conversationId - Get conversation history
router.get("/askimate/chat/:conversationId", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId: number | null = null;
    
    // Check if authenticated
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        userId = decoded.id;
      } catch {
        // Token invalid, but allow guest access
      }
    }

    const conversationId = Number(req.params.conversationId);

    const conversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.id, conversationId),
    });

    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // CRITICAL: Verify user owns this conversation (not guest access for authenticated users)
    if (userId && conversation.userId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
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

// POST /api/askimate/conversations - Create new conversation
router.post("/askimate/conversations", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Create new conversation with default title
    const [newConversation] = await db
      .insert(askimateConversations)
      .values({
        userId,
        guestSessionId: null,
        isGuest: false,
        questionCount: 0,
        title: "New Chat",
        status: "open",
      })
      .returning();

    // Auto welcome message — inserted once at creation, never duplicated
    await db.insert(askimateMessages).values({
      conversationId: newConversation.id,
      isUserMessage: false,
      sender: "ai",
      content: "Hi, I'm AskiMate, a product of Universitio. I'm here to help you find the right study path, explore your options, and guide you through your journey.",
    });

    res.json({ success: true, conversation: newConversation });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Create conversation error:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /api/askimate/conversations - Get all conversations for authenticated user
router.get("/askimate/conversations", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Get all conversations for user
    const conversations = await db.query.askimateConversations.findMany({
      where: eq(askimateConversations.userId, userId),
    });

    res.json({
      conversations: conversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// POST /api/askimate/chat/:conversationId/mark-read - Mark messages as read for user
router.post("/askimate/chat/:conversationId/mark-read", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const conversationId = Number(req.params.conversationId);

    // CRITICAL: Verify conversation belongs to user
    const conversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.id, conversationId),
    });

    if (!conversation || conversation.userId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    // Mark all unread mentor messages in this conversation as read
    await db
      .update(askimateMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(askimateMessages.conversationId, conversationId),
          eq(askimateMessages.isRead, false),
          eq(askimateMessages.sender, "mentor")
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

// GET /api/askimate/unread-count - Get unread message count for user
router.get("/askimate/unread-count", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Count unread messages for user's conversations
    const [result] = await db
      .select({ count: count() })
      .from(askimateMessages)
      .innerJoin(
        askimateConversations,
        eq(askimateMessages.conversationId, askimateConversations.id)
      )
      .where(
        and(
          eq(askimateConversations.userId, userId),
          eq(askimateMessages.isRead, false),
          eq(askimateMessages.sender, "mentor") // User only sees mentor/admin messages as unread
        )
      );

    res.json({ unreadCount: result?.count || 0 });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Unread count error:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});

// POST /api/askimate/chat/:conversationId/close - User closes their conversation
router.post("/askimate/chat/:conversationId/close", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const conversationId = Number(req.params.conversationId);

    // Verify conversation belongs to user
    const conversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.id, conversationId),
    });

    if (!conversation || conversation.userId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    const [updated] = await db
      .update(askimateConversations)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(askimateConversations.id, conversationId))
      .returning();

    res.json({ success: true, conversation: updated });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Close conversation error:", error);
    res.status(500).json({ error: "Failed to close conversation" });
  }
});

// POST /api/askimate/chat/:conversationId/reopen - User reopens their conversation
router.post("/askimate/chat/:conversationId/reopen", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const conversationId = Number(req.params.conversationId);

    // Verify conversation belongs to user
    const conversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.id, conversationId),
    });

    if (!conversation || conversation.userId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    const [updated] = await db
      .update(askimateConversations)
      .set({ status: "open", updatedAt: new Date() })
      .where(eq(askimateConversations.id, conversationId))
      .returning();

    res.json({ success: true, conversation: updated });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Reopen conversation error:", error);
    res.status(500).json({ error: "Failed to reopen conversation" });
  }
});

// PUT /api/askimate/conversations/:conversationId - Update conversation title
router.put("/askimate/conversations/:conversationId", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body as { title: string };

    if (!title || title.trim().length === 0) {
      res.status(400).json({ error: "Title cannot be empty" });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Verify user owns this conversation
    const conversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.id, parseInt(conversationId)),
    });

    if (!conversation || conversation.userId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    // Update title
    const [updated] = await db
      .update(askimateConversations)
      .set({ title: title.trim(), updatedAt: new Date() })
      .where(eq(askimateConversations.id, parseInt(conversationId)))
      .returning();

    res.json({ success: true, conversation: updated });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Update conversation error:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

// DELETE /api/askimate/conversations/:conversationId - Delete a conversation
router.delete("/askimate/conversations/:conversationId", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorised" });
      return;
    }

    const token = authHeader.slice(7);

    let userId: number;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      userId = decoded.id;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // Verify user owns this conversation
    const conversation = await db.query.askimateConversations.findFirst({
      where: eq(askimateConversations.id, parseInt(conversationId)),
    });

    if (!conversation || conversation.userId !== userId) {
      res.status(403).json({ error: "Unauthorised" });
      return;
    }

    // Delete all messages in this conversation first
    await db
      .delete(askimateMessages)
      .where(eq(askimateMessages.conversationId, parseInt(conversationId)));

    // Delete the conversation
    await db
      .delete(askimateConversations)
      .where(eq(askimateConversations.id, parseInt(conversationId)));

    res.json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    console.error("[ASKIMATE-CHAT] Delete conversation error:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

export default router;
