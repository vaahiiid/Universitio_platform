import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const heroAnalytics = pgTable("hero_analytics", {
  id: serial("id").primaryKey(),
  ipHash: text("ip_hash").notNull(),
  question: text("question"),
  outcome: text("outcome").notNull(),
  needsHumanReview: boolean("needs_human_review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HeroAnalytic = typeof heroAnalytics.$inferSelect;
export type InsertHeroAnalytic = typeof heroAnalytics.$inferInsert;
