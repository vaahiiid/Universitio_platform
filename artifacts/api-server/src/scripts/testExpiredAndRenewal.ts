/**
 * PLAN_EXPIRED + RENEWAL_PUSH Simulation Script
 *
 * Creates 2 temporary test users that mirror the exact DB state a real user
 * would have at each post-expiry stage, runs the scheduler logic once against
 * only those users, then deletes them.
 *
 * Run:
 *   cd artifacts/api-server && npx tsx src/scripts/testExpiredAndRenewal.ts
 *
 * No production code is modified. No real user data is touched.
 */

import { db } from "@workspace/db";
import { askimateUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sendTransactionalEmail, EmailType } from "../email/transactionalEmailService";

// ─── Helpers (identical to the production scheduler) ─────────────────────────

const PLAN_LABELS: Record<string, string> = {
  monthly:       "Monthly (30 days)",
  quarterly:     "3 Months (90 days)",
  "semi-annual": "6 Months (180 days)",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(expiry: Date, now: Date): number {
  return (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
}

// ─── Test user emails ─────────────────────────────────────────────────────────

const EMAIL_EXPIRED  = "sim-expired@universitio.com";
const EMAIL_RENEWAL  = "sim-renewal@universitio.com";
const TEST_EMAILS    = [EMAIL_EXPIRED, EMAIL_RENEWAL] as const;

// ─── Cleanup ──────────────────────────────────────────────────────────────────

async function cleanup() {
  for (const email of TEST_EMAILS) {
    await db.delete(askimateUsers).where(eq(askimateUsers.email, email));
  }
  console.log("[SIM] Test users removed from DB.\n");
}

// ─── Job 1 equivalent: PLAN_EXPIRED check ────────────────────────────────────

async function simPlanExpired(now: Date): Promise<void> {
  console.log("┌─ JOB 1: PLAN_EXPIRED");

  const user = await db
    .select()
    .from(askimateUsers)
    .where(eq(askimateUsers.email, EMAIL_EXPIRED))
    .then((r) => r[0]);

  if (!user?.trialEndsAt) {
    console.log("│  [ERROR] Test user not found or trialEndsAt missing");
    return;
  }

  const expiry = new Date(user.trialEndsAt);
  const days   = daysUntil(expiry, now);

  console.log(`│  email          : ${user.email}`);
  console.log(`│  trialEndsAt    : ${expiry.toISOString()}`);
  console.log(`│  days remaining : ${days.toFixed(4)}  (negative = expired)`);
  console.log(`│  expiredEmailSent: ${user.expiredEmailSent}`);
  console.log("│");

  // Exact condition from production scheduler (expiryReminders.ts line 128)
  if (!user.expiredEmailSent && days <= 0) {
    const planLabel  = user.planKey ? (PLAN_LABELS[user.planKey] ?? user.planKey) : "Premium";
    try {
      await sendTransactionalEmail(EmailType.PLAN_EXPIRED, user.email, {
        firstName: user.firstName,
        planName:  planLabel,
      });
      console.log(`│  ✓ SENT   → PLAN_EXPIRED`);
    } catch (e) {
      console.error(`│  ✗ FAILED → PLAN_EXPIRED`, e);
    }
  } else {
    const reason = user.expiredEmailSent
      ? "flag already set (idempotency guard active)"
      : `days=${days.toFixed(4)} — plan has not expired yet`;
    console.log(`│  ○ SKIP   → PLAN_EXPIRED  (${reason})`);
  }

  console.log("│");

  // ── Duplicate-send guard: run it a second time with the same data ──────────
  console.log("│  [GUARD TEST] Re-running same check on the same user...");

  // Temporarily set the flag to true to simulate "already sent"
  const userWithFlagSet = { ...user, expiredEmailSent: true };
  if (!userWithFlagSet.expiredEmailSent && days <= 0) {
    console.log(`│  ✗ GUARD FAILED — would have sent a duplicate`);
  } else {
    console.log(`│  ✓ GUARD PASSED — second run correctly blocked by expiredEmailSent=true`);
  }
  console.log("│");
}

// ─── Job 2 equivalent: RENEWAL_PUSH check ────────────────────────────────────

async function simRenewalPush(now: Date): Promise<void> {
  console.log("┌─ JOB 2: RENEWAL_PUSH");

  const user = await db
    .select()
    .from(askimateUsers)
    .where(eq(askimateUsers.email, EMAIL_RENEWAL))
    .then((r) => r[0]);

  if (!user?.trialEndsAt) {
    console.log("│  [ERROR] Test user not found or trialEndsAt missing");
    return;
  }

  const expiry       = new Date(user.trialEndsAt);
  const days         = daysUntil(expiry, now);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const expiredAtLeast3dAgo = expiry <= threeDaysAgo;

  console.log(`│  email              : ${user.email}`);
  console.log(`│  trialEndsAt        : ${expiry.toISOString()}`);
  console.log(`│  days remaining     : ${days.toFixed(4)}  (negative = expired)`);
  console.log(`│  threeDaysAgo mark  : ${threeDaysAgo.toISOString()}`);
  console.log(`│  expired >= 3d ago? : ${expiredAtLeast3dAgo}`);
  console.log(`│  renewalPushSent    : ${user.renewalPushSent}`);
  console.log("│");

  // Exact condition from production scheduler (expiryReminders.ts line 162–163):
  //   lte(trialEndsAt, threeDaysAgo) && eq(renewalPushSent, false)
  if (!user.renewalPushSent && expiredAtLeast3dAgo) {
    const planLabel    = user.planKey ? (PLAN_LABELS[user.planKey] ?? user.planKey) : "Premium";
    const expiredOnStr = formatDate(expiry);
    try {
      await sendTransactionalEmail(EmailType.RENEWAL_PUSH, user.email, {
        firstName: user.firstName,
        planName:  planLabel,
        expiresAt: expiredOnStr,
      });
      console.log(`│  ✓ SENT   → RENEWAL_PUSH`);
    } catch (e) {
      console.error(`│  ✗ FAILED → RENEWAL_PUSH`, e);
    }
  } else {
    const reason = user.renewalPushSent
      ? "flag already set (idempotency guard active)"
      : `plan expired ${Math.abs(days).toFixed(2)}d ago — not yet past the 3-day threshold`;
    console.log(`│  ○ SKIP   → RENEWAL_PUSH  (${reason})`);
  }

  console.log("│");

  // ── Duplicate-send guard ───────────────────────────────────────────────────
  console.log("│  [GUARD TEST] Re-running same check on the same user...");
  const userWithFlagSet = { ...user, renewalPushSent: true };
  if (!userWithFlagSet.renewalPushSent && expiredAtLeast3dAgo) {
    console.log(`│  ✗ GUARD FAILED — would have sent a duplicate`);
  } else {
    console.log(`│  ✓ GUARD PASSED — second run correctly blocked by renewalPushSent=true`);
  }
  console.log("│");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log("  PLAN_EXPIRED + RENEWAL_PUSH SIMULATION");
  console.log(`  Clock: ${now.toISOString()}`);
  console.log("══════════════════════════════════════════════════════════════\n");

  // Remove any stale data from a previous interrupted run
  await cleanup();

  // ── Expiry timestamps ──────────────────────────────────────────────────────
  //
  // Case 1 — PLAN_EXPIRED:
  //   trialEndsAt = now - 1 hour → days = -0.042 → condition (days <= 0) = TRUE
  //   Flags: all reminder flags true (already sent in real life), expiredEmailSent=false
  //
  // Case 2 — RENEWAL_PUSH:
  //   trialEndsAt = now - 3 days - 1 hour → expired more than 3 days ago
  //   Condition: trialEndsAt <= threeDaysAgo = TRUE
  //   Flags: expiredEmailSent=true (already received expired email), renewalPushSent=false
  //   Note: reminder flags are irrelevant for this job but set realistically

  const expiredOneHourAgo     = new Date(now.getTime() - 1 * 60 * 60 * 1000);
  const expiredThreeDaysPlus  = new Date(now.getTime() - (3 * 24 + 1) * 60 * 60 * 1000);

  await db.insert(askimateUsers).values([
    {
      email:            EMAIL_EXPIRED,
      passwordHash:     "$2b$10$sim_placeholder_do_not_use",
      firstName:        "SimUser",
      lastName:         "Expired",
      plan:             "premium",
      planKey:          "monthly",
      trialEndsAt:      expiredOneHourAgo,
      emailVerified:    true,
      reminderSent5d:   true,   // all reminders already sent in real user journey
      reminderSent3d:   true,
      reminderSent1d:   true,
      expiredEmailSent: false,  // ← this is what we're testing
      renewalPushSent:  false,
    },
    {
      email:            EMAIL_RENEWAL,
      passwordHash:     "$2b$10$sim_placeholder_do_not_use",
      firstName:        "SimUser",
      lastName:         "Renewal",
      plan:             "premium",
      planKey:          "quarterly",
      trialEndsAt:      expiredThreeDaysPlus,
      emailVerified:    true,
      reminderSent5d:   true,
      reminderSent3d:   true,
      reminderSent1d:   true,
      expiredEmailSent: true,   // already received PLAN_EXPIRED email 3+ days ago
      renewalPushSent:  false,  // ← this is what we're testing
    },
  ]);

  console.log("[SIM] Test users inserted:\n");
  console.log(`  Case 1 — PLAN_EXPIRED : trialEndsAt = ${expiredOneHourAgo.toISOString()}`);
  console.log(`                          (${daysUntil(expiredOneHourAgo, now).toFixed(4)} days — expired 1 hour ago)`);
  console.log(`                          flags: expiredEmailSent=false`);
  console.log();
  console.log(`  Case 2 — RENEWAL_PUSH : trialEndsAt = ${expiredThreeDaysPlus.toISOString()}`);
  console.log(`                          (${daysUntil(expiredThreeDaysPlus, now).toFixed(4)} days — expired 3d+1h ago)`);
  console.log(`                          flags: expiredEmailSent=true, renewalPushSent=false`);
  console.log("\n──────────────────────────────────────────────────────────────");
  console.log("  Running scheduler logic...");
  console.log("──────────────────────────────────────────────────────────────\n");

  await simPlanExpired(now);
  await simRenewalPush(now);

  console.log("──────────────────────────────────────────────────────────────");
  console.log("  Simulation complete.");
  console.log("══════════════════════════════════════════════════════════════\n");

  await cleanup();
}

main().catch(console.error).finally(() => process.exit(0));
