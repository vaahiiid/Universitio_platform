/**
 * Expiry Reminder & Renewal Push Scheduler
 *
 * Runs every hour on server startup.
 * Handles two distinct jobs:
 *
 * JOB 1 — PRE/POST-EXPIRY REMINDERS
 *   Finds premium users whose plans are expiring within 5 days (or have just expired)
 *   and sends the correct reminder email if it hasn't been sent yet.
 *   Emails: 5d reminder → 3d reminder → 1d reminder → expired notification
 *
 * JOB 2 — RENEWAL PUSH (post-expiry conversion)
 *   Finds users whose plan expired at least 3 days ago and haven't yet received
 *   a renewal push. Sends one soft conversion nudge, separate from the expired email.
 *   This is intentionally delayed so it doesn't feel like spam immediately after expiry.
 *
 * Idempotency: dedicated boolean flags on the user record, reset on every new payment.
 */

import { db } from "@workspace/db";
import { askimateUsers } from "@workspace/db/schema";
import { and, eq, isNotNull, lte, gt } from "drizzle-orm";
import { sendTransactionalEmail, EmailType } from "../email/transactionalEmailService";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const PLAN_LABELS: Record<string, string> = {
  monthly:       "Monthly (30 days)",
  quarterly:     "3 Months (90 days)",
  "semi-annual": "6 Months (180 days)",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Returns fractional days remaining (negative means expired). */
function daysUntil(expiry: Date, now: Date): number {
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
}

// ─── JOB 1: Pre/post-expiry reminders ────────────────────────────────────────

async function runExpiryReminders(now: Date): Promise<void> {
  // Window: plans expiring within the next 6 days OR already expired.
  // Lower bound is omitted intentionally — expired users with unsent flags must still be caught.
  const sixDaysFromNow = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);

  let candidates;
  try {
    candidates = await db
      .select()
      .from(askimateUsers)
      .where(
        and(
          eq(askimateUsers.plan, "premium"),
          isNotNull(askimateUsers.trialEndsAt),
          lte(askimateUsers.trialEndsAt, sixDaysFromNow),
        ),
      );
  } catch (err) {
    console.error("[EXPIRY-JOB] DB query failed (expiry reminders):", err);
    return;
  }

  if (candidates.length === 0) return;
  console.log(`[EXPIRY-JOB] Checking ${candidates.length} expiring premium account(s)`);

  for (const user of candidates) {
    if (!user.trialEndsAt) continue;

    const expiry = new Date(user.trialEndsAt);
    const days = daysUntil(expiry, now);
    const planLabel = user.planKey ? (PLAN_LABELS[user.planKey] ?? user.planKey) : "Premium";
    const expiresAtStr = formatDate(expiry);

    try {
      // ── 5-day reminder ─────────────────────────────────────────────────────
      if (!user.reminderSent5d && days > 0 && days <= 5) {
        await sendTransactionalEmail(EmailType.EXPIRY_REMINDER_5D, user.email, {
          firstName: user.firstName,
          planName: planLabel,
          expiresAt: expiresAtStr,
          daysLeft: 5,
        });
        await db
          .update(askimateUsers)
          .set({ reminderSent5d: true, updatedAt: new Date() })
          .where(eq(askimateUsers.id, user.id));
        console.log(`[EXPIRY-JOB] Sent 5d reminder → user ${user.id}`);
      }

      // ── 3-day reminder ─────────────────────────────────────────────────────
      if (!user.reminderSent3d && days > 0 && days <= 3) {
        await sendTransactionalEmail(EmailType.EXPIRY_REMINDER_3D, user.email, {
          firstName: user.firstName,
          planName: planLabel,
          expiresAt: expiresAtStr,
          daysLeft: 3,
        });
        await db
          .update(askimateUsers)
          .set({ reminderSent3d: true, updatedAt: new Date() })
          .where(eq(askimateUsers.id, user.id));
        console.log(`[EXPIRY-JOB] Sent 3d reminder → user ${user.id}`);
      }

      // ── 1-day reminder ─────────────────────────────────────────────────────
      if (!user.reminderSent1d && days > 0 && days <= 1) {
        await sendTransactionalEmail(EmailType.EXPIRY_REMINDER_1D, user.email, {
          firstName: user.firstName,
          planName: planLabel,
          expiresAt: expiresAtStr,
          daysLeft: 1,
        });
        await db
          .update(askimateUsers)
          .set({ reminderSent1d: true, updatedAt: new Date() })
          .where(eq(askimateUsers.id, user.id));
        console.log(`[EXPIRY-JOB] Sent 1d reminder → user ${user.id}`);
      }

      // ── Expired notification ───────────────────────────────────────────────
      if (!user.expiredEmailSent && days <= 0) {
        await sendTransactionalEmail(EmailType.PLAN_EXPIRED, user.email, {
          firstName: user.firstName,
          planName: planLabel,
        });
        await db
          .update(askimateUsers)
          .set({ expiredEmailSent: true, updatedAt: new Date() })
          .where(eq(askimateUsers.id, user.id));
        console.log(`[EXPIRY-JOB] Sent expired notification → user ${user.id}`);
      }
    } catch (err) {
      console.error(`[EXPIRY-JOB] Error processing user ${user.id}:`, err);
    }
  }
}

// ─── JOB 2: Renewal push (3 days after expiry) ───────────────────────────────

async function runRenewalPush(now: Date): Promise<void> {
  // Target: users whose plan expired at least 3 days ago, still on premium in DB
  // (plan column is not downgraded — expiry is enforced at query time throughout the app),
  // and who have not yet received the renewal push.
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  let candidates;
  try {
    candidates = await db
      .select()
      .from(askimateUsers)
      .where(
        and(
          eq(askimateUsers.plan, "premium"),
          isNotNull(askimateUsers.trialEndsAt),
          lte(askimateUsers.trialEndsAt, threeDaysAgo),  // expired >= 3 days ago
          eq(askimateUsers.renewalPushSent, false),
        ),
      );
  } catch (err) {
    console.error("[EXPIRY-JOB] DB query failed (renewal push):", err);
    return;
  }

  if (candidates.length === 0) return;
  console.log(`[EXPIRY-JOB] Sending renewal push to ${candidates.length} user(s)`);

  for (const user of candidates) {
    if (!user.trialEndsAt) continue;

    const planLabel = user.planKey ? (PLAN_LABELS[user.planKey] ?? user.planKey) : "Premium";
    const expiredOnStr = formatDate(new Date(user.trialEndsAt));

    try {
      await sendTransactionalEmail(EmailType.RENEWAL_PUSH, user.email, {
        firstName: user.firstName,
        planName: planLabel,
        expiresAt: expiredOnStr,
      });
      await db
        .update(askimateUsers)
        .set({ renewalPushSent: true, updatedAt: new Date() })
        .where(eq(askimateUsers.id, user.id));
      console.log(`[EXPIRY-JOB] Sent renewal push → user ${user.id}`);
    } catch (err) {
      console.error(`[EXPIRY-JOB] Renewal push error for user ${user.id}:`, err);
    }
  }
}

// ─── Combined runner ──────────────────────────────────────────────────────────

async function runExpiryCheck(): Promise<void> {
  const now = new Date();
  await runExpiryReminders(now);
  await runRenewalPush(now);
}

/**
 * Starts the expiry reminder and renewal push scheduler.
 * First check runs 2 minutes after startup, then every hour.
 */
export function startExpiryReminderScheduler(): void {
  const INITIAL_DELAY_MS = 2 * 60 * 1000;

  setTimeout(() => {
    console.log("[EXPIRY-JOB] Scheduler started — first check running now");
    runExpiryCheck();
    setInterval(() => {
      console.log("[EXPIRY-JOB] Hourly check running");
      runExpiryCheck();
    }, CHECK_INTERVAL_MS);
  }, INITIAL_DELAY_MS);

  console.log(
    `[EXPIRY-JOB] Scheduler registered — first check in ${INITIAL_DELAY_MS / 60000} min, ` +
    `then every ${CHECK_INTERVAL_MS / 3600000} hour`,
  );
}
