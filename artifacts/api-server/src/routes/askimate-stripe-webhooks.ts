import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { db } from "@workspace/db";
import { askimateUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sendTransactionalEmail, EmailType } from "../email/transactionalEmailService";

const router: IRouter = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
}

interface CheckoutSessionCompletedEvent extends Stripe.Event {
  type: "checkout.session.completed";
  data: {
    object: Stripe.Checkout.Session;
  };
}

interface SubscriptionUpdatedEvent extends Stripe.Event {
  type: "customer.subscription.updated";
  data: {
    object: Stripe.Subscription;
  };
}

interface SubscriptionDeletedEvent extends Stripe.Event {
  type: "customer.subscription.deleted";
  data: {
    object: Stripe.Subscription;
  };
}

interface InvoicePaidEvent extends Stripe.Event {
  type: "invoice.paid";
  data: {
    object: Stripe.Invoice;
  };
}

interface InvoicePaymentFailedEvent extends Stripe.Event {
  type: "invoice.payment_failed";
  data: {
    object: Stripe.Invoice;
  };
}

type WebhookEvent =
  | CheckoutSessionCompletedEvent
  | SubscriptionUpdatedEvent
  | SubscriptionDeletedEvent
  | InvoicePaidEvent
  | InvoicePaymentFailedEvent
  | Stripe.Event;

// Webhook endpoint - receives events from Stripe
router.post("/askimate/stripe-webhook", async (req: Request, res: Response) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.warn("[STRIPE-WEBHOOK] Webhook not configured");
    res.status(400).json({ error: "Webhook not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    ) as Stripe.Event;
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Signature verification failed:", error);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  try {
    // Handle specific events
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event as CheckoutSessionCompletedEvent);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event as SubscriptionUpdatedEvent);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event as SubscriptionDeletedEvent);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event as InvoicePaidEvent);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event as InvoicePaymentFailedEvent);
        break;

      default:
        console.log(`[STRIPE-WEBHOOK] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[STRIPE-WEBHOOK] Event processing failed:", error);
    res.status(500).json({ error: "Event processing failed" });
  }
});

// Plan duration in days (kept in sync with askimate-auth.ts)
const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  "semi-annual": 180,
};

// Human-readable plan labels (kept in sync with askimate-auth.ts)
const PLAN_LABELS: Record<string, string> = {
  monthly: "Monthly (30 days)",
  quarterly: "3 Months (90 days)",
  "semi-annual": "6 Months (180 days)",
};

// Handler: checkout.session.completed
// Primary fulfillment path: Stripe webhook fires reliably even if user closes tab
async function handleCheckoutSessionCompleted(event: CheckoutSessionCompletedEvent) {
  const session = event.data.object;
  console.log(`[STRIPE-WEBHOOK] Checkout session completed: ${session.id}`);

  if (session.payment_status !== "paid") {
    console.log(`[STRIPE-WEBHOOK] Session ${session.id} payment_status=${session.payment_status}, skipping`);
    return;
  }

  const userId = extractUserIdFromMetadata(session.metadata);
  if (!userId) {
    console.warn(`[STRIPE-WEBHOOK] Could not extract userId from session ${session.id}`);
    return;
  }

  // Retrieve user
  const user = await db.query.askimateUsers.findFirst({
    where: eq(askimateUsers.id, userId),
  });

  if (!user) {
    console.warn(`[STRIPE-WEBHOOK] User ${userId} not found for session ${session.id}`);
    return;
  }

  // ── Session-based idempotency: skip if this session was already processed ──
  if (user.stripeSessionId === session.id) {
    console.log(`[STRIPE-WEBHOOK] Session ${session.id} already processed for user ${userId}, skipping`);
    return;
  }

  // Extract planKey from metadata; fall back to "monthly" for legacy sessions
  const planKey = session.metadata?.planKey || "monthly";
  const durationDays = PLAN_DURATION_DAYS[planKey] ?? 30;

  // ── Time-stacking: if current plan is still active, stack from its expiry ──
  const now = new Date();
  const currentExpiry = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const baseTime = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const planExpiresAt = new Date(baseTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

  await db
    .update(askimateUsers)
    .set({
      plan: "premium",
      planKey: planKey,
      trialStartedAt: user.trialStartedAt ?? now, // preserve original activation if renewing
      trialEndsAt: planExpiresAt,
      stripeSessionId: session.id,
      // Reset all reminder flags so the new plan period gets a fresh set of reminders
      reminderSent5d: false,
      reminderSent3d: false,
      reminderSent1d: false,
      expiredEmailSent: false,
      renewalPushSent: false,
      updatedAt: new Date(),
    })
    .where(eq(askimateUsers.id, userId));

  const stackedMsg = currentExpiry && currentExpiry > now
    ? ` (stacked from ${currentExpiry.toISOString()})`
    : "";
  console.log(`[STRIPE-WEBHOOK] User ${userId} activated premium via webhook: planKey=${planKey}, expires=${planExpiresAt.toISOString()}${stackedMsg}`);

  // Send payment success email (fire-and-forget — email failure must not break fulfillment)
  const planLabel = PLAN_LABELS[planKey] ?? planKey;
  const amountStr = session.amount_total != null
    ? `£${(session.amount_total / 100).toFixed(2)}`
    : "";
  const expiresAtStr = planExpiresAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  // Use the last 12 chars of the Stripe session ID as a human-readable receipt reference
  const reference = session.id ? session.id.slice(-12).toUpperCase() : undefined;
  sendTransactionalEmail(EmailType.PAYMENT_SUCCESS, user.email, {
    firstName: user.firstName,
    planName: planLabel,
    amount: amountStr,
    expiresAt: expiresAtStr,
    reference,
  }).catch((err) => console.error("[EMAIL] Payment success email failed:", err));
}

// Handler: customer.subscription.updated
// When subscription status changes (e.g., active, past_due, unpaid, etc.)
async function handleSubscriptionUpdated(event: SubscriptionUpdatedEvent) {
  const subscription = event.data.object;
  console.log(`[STRIPE-WEBHOOK] Subscription updated: ${subscription.id}, status: ${subscription.status}`);

  // Find user by metadata
  const userId = extractUserIdFromMetadata(subscription.metadata);
  if (!userId) {
    console.warn(`[STRIPE-WEBHOOK] Could not extract userId from subscription ${subscription.id}`);
    return;
  }

  // Sync subscription status with user plan
  if (subscription.status === "active") {
    // Subscription is active (paid or in trial)
    await db
      .update(askimateUsers)
      .set({
        plan: "premium",
        updatedAt: new Date(),
      })
      .where(eq(askimateUsers.id, userId));

    console.log(`[STRIPE-WEBHOOK] User ${userId} plan set to premium (subscription active)`);
  } else if (subscription.status === "past_due" || subscription.status === "unpaid") {
    // Payment failed, but keep premium (allows grace period)
    console.log(`[STRIPE-WEBHOOK] User ${userId} subscription ${subscription.status}, keeping premium`);
  }
}

// Handler: customer.subscription.deleted
// When subscription is cancelled
async function handleSubscriptionDeleted(event: SubscriptionDeletedEvent) {
  const subscription = event.data.object;
  console.log(`[STRIPE-WEBHOOK] Subscription deleted: ${subscription.id}`);

  // Find user by metadata
  const userId = extractUserIdFromMetadata(subscription.metadata);
  if (!userId) {
    console.warn(`[STRIPE-WEBHOOK] Could not extract userId from subscription ${subscription.id}`);
    return;
  }

  // Downgrade to free plan
  await db
    .update(askimateUsers)
    .set({
      plan: "free",
      trialStartedAt: null,
      trialEndsAt: null,
      updatedAt: new Date(),
    })
    .where(eq(askimateUsers.id, userId));

  console.log(`[STRIPE-WEBHOOK] User ${userId} downgraded to free (subscription cancelled)`);
}

// Handler: invoice.paid
// When invoice is successfully paid
async function handleInvoicePaid(event: InvoicePaidEvent) {
  const invoice = event.data.object;
  console.log(`[STRIPE-WEBHOOK] Invoice paid: ${invoice.id}`);

  if (!invoice.subscription) {
    console.log(`[STRIPE-WEBHOOK] Invoice has no subscription, skipping`);
    return;
  }

  // Find user by subscription metadata
  if (typeof invoice.subscription === "string") {
    const subscriptionId = invoice.subscription;
    
    try {
      const subscription = await stripe?.subscriptions.retrieve(subscriptionId);

      if (subscription) {
        const userId = extractUserIdFromMetadata(subscription.metadata);
        if (userId) {
          // Ensure user is premium
          await db
            .update(askimateUsers)
            .set({
              plan: "premium",
              updatedAt: new Date(),
            })
            .where(eq(askimateUsers.id, userId));

          console.log(`[STRIPE-WEBHOOK] User ${userId} plan confirmed premium after invoice paid`);
        } else {
          console.warn(`[STRIPE-WEBHOOK] Could not extract userId from subscription ${subscriptionId}`);
        }
      }
    } catch (error) {
      console.error(`[STRIPE-WEBHOOK] Failed to retrieve subscription ${subscriptionId}:`, error);
    }
  }
}

// Handler: invoice.payment_failed
// When invoice payment fails
async function handleInvoicePaymentFailed(event: InvoicePaymentFailedEvent) {
  const invoice = event.data.object;
  console.log(`[STRIPE-WEBHOOK] Invoice payment failed: ${invoice.id}`);

  if (!invoice.subscription) {
    console.log(`[STRIPE-WEBHOOK] Invoice has no subscription, skipping`);
    return;
  }

  // Find user by subscription metadata
  if (typeof invoice.subscription === "string") {
    const subscriptionId = invoice.subscription;
    
    try {
      const subscription = await stripe?.subscriptions.retrieve(subscriptionId);

      if (subscription) {
        const userId = extractUserIdFromMetadata(subscription.metadata);
        if (userId) {
          // Log failure but keep premium (grace period)
          console.log(
            `[STRIPE-WEBHOOK] User ${userId} payment failed, keeping premium for grace period`
          );
        } else {
          console.warn(`[STRIPE-WEBHOOK] Could not extract userId from subscription ${subscriptionId}`);
        }
      }
    } catch (error) {
      console.error(`[STRIPE-WEBHOOK] Failed to retrieve subscription ${subscriptionId}:`, error);
    }
  }
}

// Helper: Extract userId from Stripe metadata
function extractUserIdFromMetadata(metadata: Record<string, string> | null | undefined): number | null {
  if (!metadata || !metadata.userId) {
    return null;
  }

  const userId = parseInt(metadata.userId, 10);
  return isNaN(userId) ? null : userId;
}

export default router;
