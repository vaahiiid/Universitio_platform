import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { db } from "@workspace/db";
import { askimateUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

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

// Handler: checkout.session.completed
// When payment is completed (but subscription not yet created)
async function handleCheckoutSessionCompleted(event: CheckoutSessionCompletedEvent) {
  const session = event.data.object;
  console.log(`[STRIPE-WEBHOOK] Checkout session completed: ${session.id}`);

  // Payment is complete; activate premium
  if (session.payment_status === "paid") {
    const userId = extractUserIdFromMetadata(session.metadata);

    if (userId) {
      const now = new Date();
      const trialEnds = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days

      await db
        .update(askimateUsers)
        .set({
          plan: "premium",
          trialStartedAt: now,
          trialEndsAt: trialEnds,
          updatedAt: new Date(),
        })
        .where(eq(askimateUsers.id, userId));

      console.log(`[STRIPE-WEBHOOK] User ${userId} activated premium via webhook`);
    } else {
      console.warn(`[STRIPE-WEBHOOK] Could not extract userId from session ${session.id}`);
    }
  }
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
      }
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
    const subscription = await stripe?.subscriptions.retrieve(subscriptionId);

    if (subscription) {
      const userId = extractUserIdFromMetadata(subscription.metadata);
      if (userId) {
        // Log failure but keep premium (grace period)
        console.log(
          `[STRIPE-WEBHOOK] User ${userId} payment failed, keeping premium for grace period`
        );
      }
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
