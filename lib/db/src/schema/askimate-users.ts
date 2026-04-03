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
  plan: text("plan").notNull().default("free"), // "free" or "premium"
  planKey: text("plan_key"), // "monthly" | "quarterly" | "semi-annual" | null
  trialEndsAt: timestamp("trial_ends_at"), // plan expiry date (null until premium upgrade)
  trialStartedAt: timestamp("trial_started_at"), // when premium was activated
  stripeSessionId: text("stripe_session_id"), // last processed Stripe session (idempotency)
  googleId: text("google_id").unique(),
  // ── Email verification ────────────────────────────────────────────────────
  // emailVerified starts false on password signup; set true when the user clicks the link.
  // Google OAuth users are marked verified immediately (Google already verified the address).
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),          // null once verified or never set
  emailVerificationExpiresAt: timestamp("email_verification_expires_at"), // null once verified
  // ─────────────────────────────────────────────────────────────────────────
  // ── Expiry reminder tracking ──────────────────────────────────────────────
  // Each flag is set true once the corresponding reminder is sent.
  // All four reset to false on every successful payment so renewals get fresh reminders.
  reminderSent5d: boolean("reminder_sent_5d").notNull().default(false),
  reminderSent3d: boolean("reminder_sent_3d").notNull().default(false),
  reminderSent1d: boolean("reminder_sent_1d").notNull().default(false),
  expiredEmailSent: boolean("expired_email_sent").notNull().default(false),
  // Sent 3 days after expiry — a softer renewal nudge, distinct from the pre-expiry reminders
  renewalPushSent: boolean("renewal_push_sent").notNull().default(false),
  // ─────────────────────────────────────────────────────────────────────────
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AskimateUser = typeof askimateUsers.$inferSelect;
export type InsertAskimateUser = typeof askimateUsers.$inferInsert;
