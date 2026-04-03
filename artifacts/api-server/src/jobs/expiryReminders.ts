/**
 * Expiry Reminder Scheduler
 *
 * Runs every hour on server startup.
 * Finds premium users whose plans are expiring within 5 days (or have already expired)
 * and sends the correct reminder email if it hasn't been sent yet.
 *
 * Idempotency: each of the four reminder flags (reminderSent5d, reminderSent3d,
 * reminderSent1d, expiredEmailSent) is set true once the email is sent and only
 * reset when the user makes a new purchase.
 */

import { db } from "@workspace/db";
import { askimateUsers } from "@workspace/db/schema";
import { and, eq, isNotNull, lte } from "drizzle-orm";
import { sendTransactionalEmail, EmailType } from "../email/transactionalEmailService";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

const PLAN_LABELS: Record<string, string> = {
  monthly:      "Monthly (30 days)",
  quarterly:    "3 Months (90 days)",
  "semi-annual": "6 Months (180 days)",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Computes exact days remaining until expiry.
 * Negative or zero means the plan has already expired.
 */
function daysUntil(expiry: Date, now: Date): number {
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
}

async function runExpiryCheck(): Promise<void> {
  const now = new Date();
  // Widen the query window slightly (6 days) to catch anyone who slips through
  // an hourly tick at a boundary. The reminder flags prevent duplicate sends.
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
    console.error("[EXPIRY-JOB] DB query failed:", err);
    return;
  }

  if (candidates.length === 0) return;

  console.log(`[EXPIRY-JOB] Checking ${candidates.length} expiring premium account(s)`);

  for (const user of candidates) {
    if (!user.trialEndsAt) continue;

    const days = daysUntil(new Date(user.trialEndsAt), now);
    const planLabel = user.planKey ? (PLAN_LABELS[user.planKey] ?? user.planKey) : "Premium";
    const expiresAtStr = formatDate(new Date(user.trialEndsAt));

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
        console.log(`[EXPIRY-JOB] Sent 5d reminder to user ${user.id}`);
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
        console.log(`[EXPIRY-JOB] Sent 3d reminder to user ${user.id}`);
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
        console.log(`[EXPIRY-JOB] Sent 1d reminder to user ${user.id}`);
      }

      // ── Expired email ──────────────────────────────────────────────────────
      if (!user.expiredEmailSent && days <= 0) {
        await sendTransactionalEmail(EmailType.PLAN_EXPIRED, user.email, {
          firstName: user.firstName,
          planName: planLabel,
        });
        await db
          .update(askimateUsers)
          .set({ expiredEmailSent: true, updatedAt: new Date() })
          .where(eq(askimateUsers.id, user.id));
        console.log(`[EXPIRY-JOB] Sent expired email to user ${user.id}`);
      }
    } catch (err) {
      // Per-user errors must not abort the entire batch
      console.error(`[EXPIRY-JOB] Error processing user ${user.id}:`, err);
    }
  }
}

/**
 * Starts the expiry reminder scheduler.
 * First check runs after a short delay so the server can fully initialise.
 */
export function startExpiryReminderScheduler(): void {
  // Initial check: 2 minutes after startup (lets DB connection settle)
  const INITIAL_DELAY_MS = 2 * 60 * 1000;

  setTimeout(() => {
    console.log("[EXPIRY-JOB] Scheduler started — first check running now");
    runExpiryCheck();
    setInterval(() => {
      console.log("[EXPIRY-JOB] Hourly check running");
      runExpiryCheck();
    }, CHECK_INTERVAL_MS);
  }, INITIAL_DELAY_MS);

  console.log(`[EXPIRY-JOB] Scheduler registered — first check in ${INITIAL_DELAY_MS / 60000} min, then every ${CHECK_INTERVAL_MS / 60000 / 60} hour`);
}
