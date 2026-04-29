import { pgTable, text, integer, bigint } from "drizzle-orm/pg-core";

export const heroRateLimit = pgTable("hero_rate_limit", {
  ipHash: text("ip_hash").primaryKey(),
  count: integer("count").notNull().default(1),
  windowStart: bigint("window_start", { mode: "number" }).notNull(),
});

export type HeroRateLimit = typeof heroRateLimit.$inferSelect;
export type InsertHeroRateLimit = typeof heroRateLimit.$inferInsert;
