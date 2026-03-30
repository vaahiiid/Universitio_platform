import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { db, pool } from "@workspace/db";
import { askimateUsers, askimateWeeklyUsage } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "askimate-jwt-secret-2026";
const JWT_EXPIRES_IN = "7d";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_REDIRECT_URL = process.env.STRIPE_REDIRECT_URL || "http://localhost:5173/askimate-dashboard";

let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
}

if (!process.env.JWT_SECRET) {
  console.warn("[ASKIMATE-AUTH] WARNING: JWT_SECRET not set — using fallback. Set JWT_SECRET env var for production.");
}

export interface AskimateUserPayload {
  id: number;
  email: string;
}

// Middleware to verify AskiMate user token
export function requireAskimateAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AskimateUserPayload;
    (req as any).askimateUser = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

function generateToken(payload: AskimateUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// SIGN UP
router.post("/askimate/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    };

    // Validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: "Email, password, first name, and last name are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    // Check if user exists
    const existingUser = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.email, email.toLowerCase()),
    });

    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user on FREE plan (no premium trial until explicit upgrade)
    const [newUser] = await db
      .insert(askimateUsers)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        plan: "free", // Start on free plan
        trialEndsAt: null, // No trial until upgrade
        trialStartedAt: null,
        termsAccepted: true,
        privacyAccepted: true,
        marketingConsent: false,
      })
      .returning();

    // Generate token
    const token = generateToken({ id: newUser.id, email: newUser.email });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        plan: newUser.plan,
        trialEndsAt: newUser.trialEndsAt,
      },
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN
router.post("/askimate/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user
    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.email, email.toLowerCase()),
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt,
      },
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// LOGOUT (client-side token removal is sufficient, but provide endpoint for clarity)
router.post("/askimate/logout", requireAskimateAuth, (req: Request, res: Response) => {
  // Token management is handled client-side
  res.json({ message: "Logged out successfully" });
});

// GET CURRENT USER
router.get("/askimate/me", requireAskimateAuth, async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;
    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, userPayload.id),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      dateOfBirth: user.dateOfBirth,
      marketingConsent: user.marketingConsent,
      termsAccepted: user.termsAccepted,
      privacyAccepted: user.privacyAccepted,
      plan: user.plan,
      trialEndsAt: user.trialEndsAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// UPDATE PROFILE
router.patch("/askimate/profile", requireAskimateAuth, async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;
    const { firstName, lastName, mobile, dateOfBirth, marketingConsent } = req.body as any;

    const updates: any = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (mobile !== undefined) updates.mobile = mobile || null;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth || null;
    if (marketingConsent !== undefined) updates.marketingConsent = marketingConsent;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    updates.updatedAt = new Date();

    const [updatedUser] = await db
      .update(askimateUsers)
      .set(updates)
      .where(eq(askimateUsers.id, userPayload.id))
      .returning();

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      mobile: updatedUser.mobile,
      dateOfBirth: updatedUser.dateOfBirth,
      marketingConsent: updatedUser.marketingConsent,
      plan: updatedUser.plan,
      trialEndsAt: updatedUser.trialEndsAt,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// UPGRADE TO PREMIUM (starts 3-day trial)
router.post("/askimate/upgrade-to-premium", requireAskimateAuth, async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;

    // Calculate trial end date (3 days from now)
    const trialStartedAt = new Date();
    const trialEndsAt = new Date(trialStartedAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);

    const [upgradedUser] = await db
      .update(askimateUsers)
      .set({
        plan: "premium",
        trialEndsAt,
        trialStartedAt,
        updatedAt: new Date(),
      })
      .where(eq(askimateUsers.id, userPayload.id))
      .returning();

    res.json({
      plan: upgradedUser.plan,
      trialEndsAt: upgradedUser.trialEndsAt,
      trialStartedAt: upgradedUser.trialStartedAt,
      message: "Upgraded to Premium. 3-day trial started.",
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Premium upgrade error:", error);
    res.status(500).json({ error: "Failed to upgrade to premium" });
  }
});

// GET CURRENT USER PLAN & QUOTA INFO
router.get("/askimate/plan-info", requireAskimateAuth, async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;
    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, userPayload.id),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const now = new Date();
    const trialEnd = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    let trialStatus = null;

    if (user.plan === "premium" && trialEnd && now < trialEnd) {
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      trialStatus = { isTrialing: true, daysLeft };
    }

    // Get weekly usage for free users
    const currentWeek = getCurrentWeek();
    const usage = await db.query.askimateWeeklyUsage.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userPayload.id), eq(table.week, currentWeek)),
    });

    const questionsUsed = usage?.questionsUsed || 0;
    const questionsRemaining = Math.max(0, 5 - questionsUsed);

    res.json({
      plan: user.plan,
      trialStatus,
      questionsUsed: user.plan === "free" ? questionsUsed : null,
      questionsRemaining: user.plan === "free" ? questionsRemaining : null,
      canAskQuestion: user.plan === "premium" || questionsRemaining > 0,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Plan info error:", error);
    res.status(500).json({ error: "Failed to fetch plan info" });
  }
});

function getCurrentWeek(): string {
  const now = new Date();
  const start = new Date(now);
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);

  const year = start.getFullYear();
  const week = Math.ceil(((now.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

// STRIPE CHECKOUT SESSION
router.post("/askimate/checkout-session", requireAskimateAuth, async (req: Request, res: Response) => {
  if (!stripe) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;
    const { plan } = req.body as { plan?: string };

    if (!plan || !["monthly", "quarterly", "semi-annual"].includes(plan)) {
      res.status(400).json({ error: "Invalid plan selected" });
      return;
    }

    // Plan pricing in pence (£12 = 1200 pence, etc.)
    const priceMap: { [key: string]: number } = {
      monthly: 1200,
      quarterly: 3000,
      "semi-annual": 6500,
    };

    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, userPayload.id),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Create ephemeral Stripe session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "AskiMate AI Premium Mentoring",
              description: plan === "monthly" ? "Monthly subscription with 3-day free trial" :
                          plan === "quarterly" ? "3-month subscription with 3-day free trial" :
                          "6-month subscription with 3-day free trial",
            },
            unit_amount: priceMap[plan],
          },
          quantity: 1,
        },
      ],
      success_url: `${STRIPE_REDIRECT_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${STRIPE_REDIRECT_URL}?cancelled=true`,
      client_reference_id: String(userPayload.id),
      customer_email: user.email,
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Checkout session error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// CONFIRM PREMIUM (called after successful payment)
router.post("/askimate/confirm-premium", requireAskimateAuth, async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;

    // Update user to premium with trial dates
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
      .where(eq(askimateUsers.id, userPayload.id));

    res.json({
      success: true,
      plan: "premium",
      trialStartsAt: now,
      trialEndsAt: trialEnds,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Confirm premium error:", error);
    res.status(500).json({ error: "Failed to activate premium" });
  }
});

export default router;
