import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const askimateUsers = pgTable("askimate_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  mobile: text("mobile"),
  dateOfBirth: text("date_of_birth"),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  termsAccepted: boolean("terms_accepted").notNull().default(true),
  privacyAccepted: boolean("privacy_accepted").notNull().default(true),
  plan: text("plan").notNull().default("free"),
  trialEndsAt: timestamp("trial_ends_at"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AskimateUser = typeof askimateUsers.$inferSelect;
export type InsertAskimateUser = typeof askimateUsers.$inferInsert;
