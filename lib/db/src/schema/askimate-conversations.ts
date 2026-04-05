import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

// Conversations for both guest and registered users
export const askimateConversations = pgTable("askimate_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // null if guest
  guestSessionId: text("guest_session_id"), // unique ID for guest sessions
  title: text("title").default("New Conversation"),
  isGuest: boolean("is_guest").notNull().default(true),
  questionCount: integer("question_count").default(0),
  status: text("status").notNull().default("open"), // "open" or "closed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Individual messages in conversations
export const askimateMessages = pgTable("askimate_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  isUserMessage: boolean("is_user_message").notNull(), // true = user question, false = non-user (AI or mentor)
  sender: text("sender").notNull().default("ai"), // "user", "ai", or "mentor"
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false), // Track read status for notifications
  // AI context stored on "ai" sender messages: { reviewLevel, needsHumanReview, sources, aiAttempt }
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weekly question usage tracking for free users
export const askimateWeeklyUsage = pgTable("askimate_weekly_usage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  week: text("week").notNull(), // ISO week (YYYY-W##)
  questionsUsed: integer("questions_used").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AskimateConversation = typeof askimateConversations.$inferSelect;
export type InsertAskimateConversation = typeof askimateConversations.$inferInsert;

export type AskimateMessage = typeof askimateMessages.$inferSelect;
export type InsertAskimateMessage = typeof askimateMessages.$inferInsert;

export type AskimateWeeklyUsage = typeof askimateWeeklyUsage.$inferSelect;
export type InsertAskimateWeeklyUsage = typeof askimateWeeklyUsage.$inferInsert;
