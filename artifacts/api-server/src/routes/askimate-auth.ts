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

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";

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

    // Detect Google-only accounts (no password set)
    if (user.passwordHash === "GOOGLE_NO_PASSWORD") {
      res.status(401).json({ error: "This account uses Google Sign-In. Please click 'Continue with Google' to log in." });
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

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE OAUTH — INITIATE
// ─────────────────────────────────────────────────────────────────────────────
router.get("/askimate/auth/google", (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    res.status(503).json({ error: "Google authentication is not configured on this server." });
    return;
  }

  // Generate a signed state token (CSRF protection — 10-minute TTL)
  const state = jwt.sign({ purpose: "google-oauth-state" }, JWT_SECRET, { expiresIn: "10m" });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE OAUTH — CALLBACK
// ─────────────────────────────────────────────────────────────────────────────
router.get("/askimate/auth/google/callback", async (req: Request, res: Response) => {
  const { code, state, error: oauthError } = req.query as Record<string, string | undefined>;

  // User denied or Google returned an error
  if (oauthError) {
    console.warn("[ASKIMATE-AUTH] Google OAuth error returned:", oauthError);
    res.redirect(`/askimate-login?google_error=${encodeURIComponent("Google sign-in was cancelled or denied.")}`);
    return;
  }

  if (!code || !state) {
    res.redirect(`/askimate-login?google_error=${encodeURIComponent("Invalid Google callback — missing parameters.")}`);
    return;
  }

  // Verify the state token (CSRF check)
  try {
    jwt.verify(state, JWT_SECRET);
  } catch {
    res.redirect(`/askimate-login?google_error=${encodeURIComponent("Security check failed. Please try again.")}`);
    return;
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    res.redirect(`/askimate-login?google_error=${encodeURIComponent("Google authentication is not configured on this server.")}`);
    return;
  }

  try {
    // ── Step 1: Exchange authorisation code for access token ──────────────────
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = (await tokenRes.json()) as Record<string, unknown>;

    if (!tokenData.access_token) {
      console.error("[ASKIMATE-AUTH] Google token exchange failed:", tokenData);
      res.redirect(`/askimate-login?google_error=${encodeURIComponent("Failed to authenticate with Google. Please try again.")}`);
      return;
    }

    // ── Step 2: Fetch Google user profile ─────────────────────────────────────
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = (await profileRes.json()) as {
      id?: string;
      email?: string;
      verified_email?: boolean;
      given_name?: string;
      family_name?: string;
      name?: string;
    };

    if (!googleUser.email) {
      res.redirect(`/askimate-login?google_error=${encodeURIComponent("Google did not provide an email address.")}`);
      return;
    }

    if (!googleUser.verified_email) {
      res.redirect(`/askimate-login?google_error=${encodeURIComponent("Your Google account email is not verified. Please verify it first.")}`);
      return;
    }

    const emailLower = googleUser.email.toLowerCase();

    // ── Step 3: Find or create user (safe email-based matching) ───────────────
    let dbUser = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.email, emailLower),
    });

    if (dbUser) {
      // Existing user — link Google ID if not already linked
      if (!dbUser.googleId && googleUser.id) {
        const [updated] = await db
          .update(askimateUsers)
          .set({ googleId: googleUser.id, updatedAt: new Date() })
          .where(eq(askimateUsers.id, dbUser.id))
          .returning();
        dbUser = updated;
      }
      // (If googleId already set or user had email/password, we just log them in — no overwrite)
    } else {
      // New user — create account with Google data
      const firstName = googleUser.given_name || (googleUser.name ? googleUser.name.split(" ")[0] : "User");
      const lastName = googleUser.family_name || (googleUser.name ? googleUser.name.split(" ").slice(1).join(" ") : "");

      const [newUser] = await db
        .insert(askimateUsers)
        .values({
          email: emailLower,
          passwordHash: "GOOGLE_NO_PASSWORD",
          firstName,
          lastName,
          googleId: googleUser.id || null,
          plan: "free",
          marketingConsent: false,
          termsAccepted: true,
          privacyAccepted: true,
        })
        .returning();

      dbUser = newUser;
    }

    // ── Step 4: Generate JWT and redirect to dashboard ─────────────────────────
    const token = generateToken({ id: dbUser.id, email: dbUser.email });

    console.log(`[ASKIMATE-AUTH] Google OAuth success — user ${dbUser.id} (${dbUser.email})`);

    res.redirect(`/askimate-dashboard?google_token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("[ASKIMATE-AUTH] Google callback error:", err);
    res.redirect(`/askimate-login?google_error=${encodeURIComponent("An unexpected error occurred. Please try again.")}`);
  }
});

// Helper: determine if a user currently has active premium access
function isActivePremium(user: { plan: string; trialEndsAt?: Date | null }): boolean {
  if (user.plan !== "premium") return false;
  if (!user.trialEndsAt) return false; // premium with no expiry date — treat as expired
  return new Date(user.trialEndsAt) > new Date();
}

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
    const planExpiresAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const activePremium = isActivePremium(user);
    const isExpired = user.plan === "premium" && !!planExpiresAt && planExpiresAt <= now;

    // Days remaining for active premium
    let daysRemaining: number | null = null;
    if (activePremium && planExpiresAt) {
      daysRemaining = Math.ceil((planExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Weekly usage — always fetch (needed even for expired premium treated as free)
    const currentWeek = getCurrentWeek();
    const usage = await db.query.askimateWeeklyUsage.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userPayload.id), eq(table.week, currentWeek)),
    });

    const questionsUsed = usage?.questionsUsed || 0;
    const questionsRemaining = Math.max(0, 5 - questionsUsed);

    // Effective plan: if premium but expired, the user is effectively on free
    const effectivePlan = activePremium ? "premium" : "free";

    res.json({
      // Raw plan stored in DB
      plan: user.plan,
      // Effective plan after expiry check
      effectivePlan,
      isPremiumActive: activePremium,
      isExpired,
      // Plan metadata
      planKey: user.planKey || null,
      planLabel: user.planKey ? (PLAN_LABELS[user.planKey] ?? user.planKey) : null,
      planActivatedAt: user.trialStartedAt ? user.trialStartedAt.toISOString() : null,
      planExpiresAt: planExpiresAt ? planExpiresAt.toISOString() : null,
      daysRemaining,
      // Usage (returned for all users; null for active premium)
      questionsUsed: effectivePlan === "free" ? questionsUsed : null,
      questionsRemaining: effectivePlan === "free" ? questionsRemaining : null,
      canAskQuestion: activePremium || questionsRemaining > 0,
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
    const userIdString = String(userPayload.id);
    // Strip any existing query string from the redirect URL to build clean success/cancel URLs
    const baseRedirectUrl = STRIPE_REDIRECT_URL.split("?")[0];
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "AskiMate AI Premium Mentoring",
              description: plan === "monthly" ? "Monthly — 30 days of unlimited access" :
                          plan === "quarterly" ? "3 months (90 days) of unlimited access" :
                          "6 months (180 days) of unlimited access",
            },
            unit_amount: priceMap[plan],
          },
          quantity: 1,
        },
      ],
      success_url: `${baseRedirectUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseRedirectUrl}?cancelled=true`,
      client_reference_id: userIdString,
      customer_email: user.email,
      // planKey in metadata so webhook + confirm-premium know exactly what was purchased
      metadata: {
        userId: userIdString,
        planKey: plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Checkout session error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Plan duration in days
const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  "semi-annual": 180,
};

// Human-readable plan names
const PLAN_LABELS: Record<string, string> = {
  monthly: "Monthly (30 days)",
  quarterly: "3 Months (90 days)",
  "semi-annual": "6 Months (180 days)",
};

// CONFIRM PREMIUM (called after successful Stripe payment redirect)
router.post("/askimate/confirm-premium", requireAskimateAuth, async (req: Request, res: Response) => {
  if (!stripe) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;
    const { sessionId } = req.body as { sessionId?: string };

    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    // Retrieve user from DB
    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, userPayload.id),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // ── Idempotency: if this exact session was already processed, return current state ──
    if (user.stripeSessionId === sessionId) {
      console.log(`[ASKIMATE-AUTH] Session ${sessionId} already processed for user ${user.id}, returning current state`);
      res.json({
        success: true,
        alreadyProcessed: true,
        plan: user.plan,
        planKey: user.planKey,
        planLabel: user.planKey ? PLAN_LABELS[user.planKey] : null,
        planActivatedAt: user.trialStartedAt,
        planExpiresAt: user.trialEndsAt,
      });
      return;
    }

    // ── Retrieve and validate Stripe session ──
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      console.error("[ASKIMATE-AUTH] Stripe session retrieval failed:", error);
      res.status(400).json({ error: "Invalid payment session" });
      return;
    }

    if (stripeSession.payment_status !== "paid") {
      res.status(400).json({ error: "Payment not completed" });
      return;
    }

    if (stripeSession.status !== "complete") {
      res.status(400).json({ error: "Checkout session not complete" });
      return;
    }

    // Case-insensitive email check
    if (stripeSession.customer_email?.toLowerCase() !== user.email.toLowerCase()) {
      console.error(`[ASKIMATE-AUTH] Email mismatch for session ${sessionId}: ${stripeSession.customer_email} vs ${user.email}`);
      res.status(400).json({ error: "Payment session email mismatch" });
      return;
    }

    // ── Extract planKey from Stripe metadata ──
    const planKey = stripeSession.metadata?.planKey || "monthly";
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
        stripeSessionId: sessionId,
        updatedAt: new Date(),
      })
      .where(eq(askimateUsers.id, userPayload.id));

    const stackedMessage = currentExpiry && currentExpiry > now
      ? ` (stacked from ${currentExpiry.toISOString()})`
      : "";
    console.log(`[ASKIMATE-AUTH] User ${user.id} activated premium: planKey=${planKey}, expires=${planExpiresAt.toISOString()}${stackedMessage}`);

    res.json({
      success: true,
      plan: "premium",
      planKey,
      planLabel: PLAN_LABELS[planKey],
      planActivatedAt: now,
      planExpiresAt,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Confirm premium error:", error);
    res.status(500).json({ error: "Failed to activate premium" });
  }
});

export default router;
