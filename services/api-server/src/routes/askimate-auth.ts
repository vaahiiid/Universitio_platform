import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import Stripe from "stripe";
import { db, pool } from "@workspace/db";
import { askimateUsers, askimateWeeklyUsage } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { sendTransactionalEmail, EmailType } from "../email/transactionalEmailService";

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

// (OAuth tokens are delivered via HttpOnly cookie — see consume-pending-token endpoint)

// ─────────────────────────────────────────────────────────────────────────────
// PENDING PAYMENT STORE
// Maps userId → Stripe sessionId. Populated at checkout-session creation so
// the Stripe session ID does NOT need to appear in the success_url. The frontend
// only receives a generic ?payment=success signal; the backend looks up the
// pending session by the authenticated user's ID. Entries expire after 2 hours
// (enough time for a user to complete Stripe checkout and land back on the app).
// ─────────────────────────────────────────────────────────────────────────────
interface PendingPaymentEntry {
  sessionId: string;
  expiresAt: number;
}
const pendingPaymentStore = new Map<number, PendingPaymentEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of pendingPaymentStore) {
    if (now > entry.expiresAt) pendingPaymentStore.delete(userId);
  }
}, 10 * 60 * 1000);

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

/**
 * Generates a secure, single-use email verification token with a 24-hour expiry.
 * Uses 32 bytes of cryptographically random data → 64-char hex string.
 */
function generateVerificationToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return { token, expiresAt };
}

// ─────────────────────────────────────────────────────────────────────────────
// SIGN UP (password)
// ─────────────────────────────────────────────────────────────────────────────
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

    // Generate email verification token
    const { token: verificationToken, expiresAt: verificationExpiresAt } = generateVerificationToken();

    // Create user on FREE plan (no premium trial until explicit upgrade)
    const [newUser] = await db
      .insert(askimateUsers)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        plan: "free",
        trialEndsAt: null,
        trialStartedAt: null,
        termsAccepted: true,
        privacyAccepted: true,
        marketingConsent: false,
        // Email verification — starts unverified; token cleared once user clicks link
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpiresAt: verificationExpiresAt,
      })
      .returning();

    // Generate JWT
    const token = generateToken({ id: newUser.id, email: newUser.email });

    // Send welcome email (fire-and-forget)
    sendTransactionalEmail(EmailType.SIGNUP_WELCOME, newUser.email, {
      firstName: newUser.firstName,
    }).catch((err) => console.error("[EMAIL] Signup welcome failed:", err));

    // Send verification email (fire-and-forget — email failure must not break signup)
    const verificationLink = `https://universitio.com/api/askimate/auth/verify-email?token=${verificationToken}`;
    sendTransactionalEmail(EmailType.EMAIL_VERIFICATION, newUser.email, {
      firstName: newUser.firstName,
      verificationLink,
      expiryHours: 24,
    }).catch((err) => console.error("[EMAIL] Verification email failed:", err));

    // Admin notification — new user signup (fire-and-forget)
    const signupAdminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "vahidmoir@gmail.com")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    for (const recipient of signupAdminEmails) {
      sendTransactionalEmail(EmailType.ADMIN_NOTIFICATION, recipient, {
        event: "New User Signup",
        userName: `${newUser.firstName} ${newUser.lastName}`.trim(),
        userEmail: newUser.email,
        adminLink: "https://universitio.com/admin",
      }).catch((err) => console.error("[EMAIL] Admin signup notification failed:", err));
    }

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        plan: newUser.plan,
        trialEndsAt: newUser.trialEndsAt,
        emailVerified: newUser.emailVerified,
      },
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────────────────────
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

    // Record login as meaningful activity for re-engagement tracking (fire-and-forget)
    db.update(askimateUsers)
      .set({ lastActiveAt: new Date(), updatedAt: new Date() })
      .where(eq(askimateUsers.id, user.id))
      .catch((err) => console.error("[ACTIVITY] Failed to update lastActiveAt on login:", err));

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        trialEndsAt: user.trialEndsAt,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────────────────────
router.post("/askimate/logout", requireAskimateAuth, (req: Request, res: Response) => {
  // Token management is handled client-side
  res.json({ message: "Logged out successfully" });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────────────────────────────────────
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
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────────────────────────────────────
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
      emailVerified: updatedUser.emailVerified,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY EMAIL — clicked from the email link
// GET /api/askimate/auth/verify-email?token=...
// ─────────────────────────────────────────────────────────────────────────────
router.get("/askimate/auth/verify-email", async (req: Request, res: Response) => {
  const { token } = req.query as { token?: string };

  if (!token || typeof token !== "string" || token.trim() === "") {
    res.redirect("/askimate-login?verify_error=invalid");
    return;
  }

  try {
    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.emailVerificationToken, token.trim()),
    });

    if (!user) {
      // Token not found — already used or never issued
      console.warn(`[ASKIMATE-AUTH] Verification attempt with unknown/used token (prefix: ${token.slice(0, 8)}...)`);
      res.redirect("/askimate-login?verify_error=invalid");
      return;
    }

    // Check expiry
    if (!user.emailVerificationExpiresAt || new Date(user.emailVerificationExpiresAt) < new Date()) {
      console.warn(`[ASKIMATE-AUTH] Expired verification token for user ${user.id}`);
      res.redirect("/askimate-login?verify_error=expired");
      return;
    }

    // Mark verified — clear the token so it becomes single-use
    await db
      .update(askimateUsers)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(askimateUsers.id, user.id));

    console.log(`[ASKIMATE-AUTH] Email verified for user ${user.id} (${user.email})`);

    // Send confirmation email (fire-and-forget — must not block the redirect)
    sendTransactionalEmail(EmailType.EMAIL_VERIFIED, user.email, {
      firstName: user.firstName,
    }).catch((err) => console.error("[EMAIL] Email verified confirmation failed:", err));

    // Redirect to dashboard with success param so the frontend can show a banner
    res.redirect("/askimate-dashboard?verified=true");
  } catch (err) {
    console.error("[ASKIMATE-AUTH] Email verification error:", err);
    res.redirect("/askimate-login?verify_error=server");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESEND VERIFICATION EMAIL
// POST /api/askimate/auth/resend-verification
// ─────────────────────────────────────────────────────────────────────────────
router.post("/askimate/auth/resend-verification", requireAskimateAuth, async (req: Request, res: Response) => {
  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;

    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, userPayload.id),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Already verified — nothing to do
    if (user.emailVerified) {
      res.json({ message: "Your email address is already verified." });
      return;
    }

    // Google users are always verified — this shouldn't be reachable, but guard it
    if (user.googleId && !user.emailVerificationToken) {
      res.json({ message: "Your email address is already verified via Google." });
      return;
    }

    // Generate a fresh token + expiry
    const { token: newToken, expiresAt: newExpiresAt } = generateVerificationToken();

    await db
      .update(askimateUsers)
      .set({
        emailVerificationToken: newToken,
        emailVerificationExpiresAt: newExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(askimateUsers.id, user.id));

    const verificationLink = `https://universitio.com/api/askimate/auth/verify-email?token=${newToken}`;

    sendTransactionalEmail(EmailType.EMAIL_VERIFICATION, user.email, {
      firstName: user.firstName,
      verificationLink,
      expiryHours: 24,
    }).catch((err) => console.error("[EMAIL] Resend verification failed:", err));

    console.log(`[ASKIMATE-AUTH] Verification email re-sent for user ${user.id} (${user.email})`);
    res.json({ message: "Verification email sent. Please check your inbox." });
  } catch (err) {
    console.error("[ASKIMATE-AUTH] Resend verification error:", err);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD — request a reset email
// POST /api/askimate/auth/forgot-password
// Always responds with the same neutral message to avoid email enumeration.
// Stores a SHA-256 hash of the raw token; raw token travels only in the email.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/askimate/auth/forgot-password", async (req: Request, res: Response) => {
  const NEUTRAL_MSG = "If an account exists with this email, you will receive a password reset link shortly.";

  try {
    const { email } = req.body as { email?: string };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }

    const normalised = email.toLowerCase().trim();

    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.email, normalised),
    });

    // Respond identically regardless of whether the user exists
    if (!user) {
      res.json({ message: NEUTRAL_MSG });
      return;
    }

    // Google-only accounts have no password — silently skip (same neutral response)
    if (user.passwordHash === "GOOGLE_NO_PASSWORD") {
      res.json({ message: NEUTRAL_MSG });
      return;
    }

    // Generate a 32-byte cryptographically random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    // Store only the SHA-256 hash in the database
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

    await db
      .update(askimateUsers)
      .set({
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(askimateUsers.id, user.id));

    const resetLink = `https://universitio.com/reset-password?token=${rawToken}`;

    sendTransactionalEmail(EmailType.PASSWORD_RESET, user.email, {
      firstName: user.firstName,
      resetLink,
      expiryMinutes: 60,
    }).catch((err) => console.error("[EMAIL] Password reset email failed:", err));

    console.log(`[ASKIMATE-AUTH] Password reset requested for user ${user.id}`);
    res.json({ message: NEUTRAL_MSG });
  } catch (err) {
    console.error("[ASKIMATE-AUTH] Forgot password error:", err);
    // Still return neutral message — don't expose server errors to the client
    res.json({ message: "If an account exists with this email, you will receive a password reset link shortly." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD — consume the token and set a new password
// POST /api/askimate/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
router.post("/askimate/auth/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };

    if (!token || typeof token !== "string" || token.trim() === "") {
      res.status(400).json({ error: "Reset token is required." });
      return;
    }

    if (!password || typeof password !== "string") {
      res.status(400).json({ error: "New password is required." });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters." });
      return;
    }

    // Hash the incoming raw token to compare with the stored hash
    const tokenHash = crypto.createHash("sha256").update(token.trim()).digest("hex");

    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.passwordResetToken, tokenHash),
    });

    if (!user) {
      res.status(400).json({ error: "This reset link is invalid or has already been used." });
      return;
    }

    if (!user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt) < new Date()) {
      // Clear the expired token
      await db
        .update(askimateUsers)
        .set({ passwordResetToken: null, passwordResetExpiresAt: null, updatedAt: new Date() })
        .where(eq(askimateUsers.id, user.id));
      res.status(400).json({ error: "This reset link has expired. Please request a new one." });
      return;
    }

    // Hash the new password and clear the reset token (single-use)
    const passwordHash = await bcrypt.hash(password, 12);

    await db
      .update(askimateUsers)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(askimateUsers.id, user.id));

    console.log(`[ASKIMATE-AUTH] Password reset successful for user ${user.id}`);
    res.json({ message: "Your password has been reset. You can now log in." });
  } catch (err) {
    console.error("[ASKIMATE-AUTH] Reset password error:", err);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
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

    // ── Step 3: Find or create user ───────────────────────────────────────────
    let dbUser = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.email, emailLower),
    });

    if (dbUser) {
      // Existing user — link Google ID if not set; also mark email as verified
      // (Google verified_email = true is trusted; this benefits existing password users who sign in with Google)
      const needsUpdate = (!dbUser.googleId && googleUser.id) || !dbUser.emailVerified;
      if (needsUpdate) {
        const updateValues: any = { updatedAt: new Date() };
        if (!dbUser.googleId && googleUser.id) updateValues.googleId = googleUser.id;
        if (!dbUser.emailVerified) {
          updateValues.emailVerified = true;
          updateValues.emailVerificationToken = null;
          updateValues.emailVerificationExpiresAt = null;
        }
        const [updated] = await db
          .update(askimateUsers)
          .set(updateValues)
          .where(eq(askimateUsers.id, dbUser.id))
          .returning();
        dbUser = updated;
      }
    } else {
      // New user — create account with Google data; mark email verified immediately
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
          // Google already verified this email address — mark trusted immediately
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
        })
        .returning();

      dbUser = newUser;

      // Send welcome email for new Google OAuth users (fire-and-forget)
      // No verification email needed — they're already verified
      sendTransactionalEmail(EmailType.SIGNUP_WELCOME, newUser.email, {
        firstName: newUser.firstName,
      }).catch((err) => console.error("[EMAIL] Signup welcome (Google) failed:", err));
    }

    // ── Step 4: Generate JWT, set as an HttpOnly cookie, and redirect ──────────
    // The JWT is delivered via a short-lived HttpOnly cookie, NOT in the URL.
    // This means the bearer token never appears in browser history, server logs,
    // analytics, or any redirect URL. The cookie is consumed by the first call
    // to POST /api/askimate/consume-pending-token and then cleared.
    const token = generateToken({ id: dbUser.id, email: dbUser.email });

    const IS_PRODUCTION = process.env.NODE_ENV === "production";
    res.cookie("askimate_pending_token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: "lax",
      maxAge: 2 * 60 * 1000, // 2 minutes — only needs to survive the redirect
      path: "/api/askimate/consume-pending-token",
    });

    console.log(`[ASKIMATE-AUTH] Google OAuth success — user ${dbUser.id} (${dbUser.email})`);

    res.redirect("/askimate-dashboard");
  } catch (err) {
    console.error("[ASKIMATE-AUTH] Google callback error:", err);
    res.redirect(`/askimate-login?google_error=${encodeURIComponent("An unexpected error occurred. Please try again.")}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONSUME PENDING TOKEN (Google OAuth post-login)
// Called by the frontend immediately after landing on the dashboard.
// The JWT was placed in an HttpOnly cookie (askimate_pending_token) by the OAuth
// callback and is invisible to the browser's JS, analytics, and URL bar.
// This endpoint pops the cookie, returns the JWT in the response body, and
// clears the cookie so it can only be used once.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/askimate/consume-pending-token", (req: Request, res: Response) => {
  const token = (req as any).cookies?.askimate_pending_token as string | undefined;
  if (!token) {
    res.status(404).json({ error: "No pending token" });
    return;
  }
  // Clear the cookie immediately (single-use)
  res.clearCookie("askimate_pending_token", {
    path: "/api/askimate/consume-pending-token",
  });
  res.json({ token });
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if the user currently has active paid premium access. */
function isActivePremium(user: { plan: string; trialEndsAt?: Date | null }): boolean {
  if (user.plan !== "premium") return false;
  if (!user.trialEndsAt) return false;
  return new Date(user.trialEndsAt) > new Date();
}

const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  "semi-annual": 180,
};

const PLAN_LABELS: Record<string, string> = {
  monthly: "Monthly (30 days)",
  quarterly: "3 Months (90 days)",
  "semi-annual": "6 Months (180 days)",
};

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

// ─────────────────────────────────────────────────────────────────────────────
// GET CURRENT USER PLAN & QUOTA INFO
// ─────────────────────────────────────────────────────────────────────────────
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

    let daysRemaining: number | null = null;
    if (activePremium && planExpiresAt) {
      daysRemaining = Math.ceil((planExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    const currentWeek = getCurrentWeek();
    const usage = await db.query.askimateWeeklyUsage.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.userId, userPayload.id), eq(table.week, currentWeek)),
    });

    const questionsUsed = usage?.questionsUsed || 0;
    const questionsRemaining = Math.max(0, 5 - questionsUsed);
    const effectivePlan = activePremium ? "premium" : "free";

    res.json({
      plan: user.plan,
      effectivePlan,
      isPremiumActive: activePremium,
      isExpired,
      planKey: user.planKey || null,
      planLabel: user.planKey ? (PLAN_LABELS[user.planKey] ?? user.planKey) : null,
      planActivatedAt: user.trialStartedAt ? user.trialStartedAt.toISOString() : null,
      planExpiresAt: planExpiresAt ? planExpiresAt.toISOString() : null,
      daysRemaining,
      questionsUsed: effectivePlan === "free" ? questionsUsed : null,
      questionsRemaining: effectivePlan === "free" ? questionsRemaining : null,
      canAskQuestion: activePremium || questionsRemaining > 0,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Plan info error:", error);
    res.status(500).json({ error: "Failed to fetch plan info" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE CHECKOUT SESSION
// ─────────────────────────────────────────────────────────────────────────────
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

    const userIdString = String(userPayload.id);
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
      // The session_id is stored server-side (pendingPaymentStore) keyed by userId
      // so it does NOT need to appear in the URL. The success_url only carries a
      // non-sensitive ?payment=success signal; the backend retrieves the session ID
      // by looking up the authenticated caller in pendingPaymentStore.
      success_url: `${baseRedirectUrl}?payment=success`,
      cancel_url: `${baseRedirectUrl}?cancelled=true`,
      client_reference_id: userIdString,
      customer_email: user.email,
      // Metadata on the Checkout Session (used by checkout.session.completed handler)
      metadata: {
        userId: userIdString,
        planKey: plan,
      },
      // Metadata also on the PaymentIntent so payment_intent.payment_failed can find the user
      payment_intent_data: {
        metadata: {
          userId: userIdString,
          planKey: plan,
        },
      },
    });

    // Store the session ID server-side so the frontend never needs to handle it
    pendingPaymentStore.set(userPayload.id, {
      sessionId: session.id,
      expiresAt: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Checkout session error:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM PREMIUM (called after successful Stripe payment redirect)
// ─────────────────────────────────────────────────────────────────────────────
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

    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, userPayload.id),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Idempotency: if this exact session was already processed, return current state
    if (user.stripeSessionId === sessionId) {
      console.log(`[ASKIMATE-AUTH] Session ${sessionId} already processed for user ${user.id}, returning current state`);
      res.json({
        success: true,
        alreadyProcessed: true,
        plan: user.plan,
        planKey: user.planKey,
        trialEndsAt: user.trialEndsAt,
      });
      return;
    }

    // Retrieve and validate the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Payment not completed" });
      return;
    }

    // ── Ownership check ──────────────────────────────────────────────────────
    // Verify the Stripe session was created for the currently authenticated user.
    // client_reference_id and metadata.userId are both set at checkout-session
    // creation time and cannot be forged by the caller, so comparing either one
    // to the authenticated user's ID prevents a paid session from being applied
    // to a different account.
    const sessionOwnerIdStr = session.client_reference_id ?? session.metadata?.userId;
    if (!sessionOwnerIdStr || String(userPayload.id) !== String(sessionOwnerIdStr)) {
      console.warn(
        `[ASKIMATE-AUTH] Ownership mismatch — session ${sessionId} belongs to userId ${sessionOwnerIdStr}, ` +
        `but caller is userId ${userPayload.id}`,
      );
      res.status(403).json({ error: "This payment session does not belong to your account" });
      return;
    }

    // Determine plan from metadata
    const planKey = (session.metadata?.planKey as string) || "monthly";
    if (!PLAN_DURATION_DAYS[planKey]) {
      res.status(400).json({ error: "Unknown plan in session metadata" });
      return;
    }

    // Calculate expiry — stack on top of existing expiry if still active
    const now = new Date();
    const currentExpiry = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const planExpiresAt = new Date(baseDate.getTime() + PLAN_DURATION_DAYS[planKey] * 24 * 60 * 60 * 1000);

    const [updatedUser] = await db
      .update(askimateUsers)
      .set({
        plan: "premium",
        planKey,
        trialStartedAt: user.trialStartedAt ?? now,
        trialEndsAt: planExpiresAt,
        stripeSessionId: sessionId,
        updatedAt: now,
      })
      .where(eq(askimateUsers.id, user.id))
      .returning();

    console.log(`[ASKIMATE-AUTH] Premium confirmed — user ${user.id}, plan ${planKey}, expires ${planExpiresAt.toISOString()}`);

    res.json({
      success: true,
      plan: updatedUser.plan,
      planKey: updatedUser.planKey,
      trialEndsAt: updatedUser.trialEndsAt,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Confirm premium error:", error);
    res.status(500).json({ error: "Failed to confirm premium" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM PENDING PAYMENT (called after ?payment=success redirect — no session_id in URL)
// The session ID was stored server-side when the checkout was created. The
// frontend never needs to handle or transmit the session ID; ownership is
// guaranteed because pendingPaymentStore is keyed by the authenticated user's ID.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/askimate/confirm-pending-payment", requireAskimateAuth, async (req: Request, res: Response) => {
  if (!stripe) {
    res.status(500).json({ error: "Stripe not configured" });
    return;
  }

  try {
    const userPayload = (req as any).askimateUser as AskimateUserPayload;

    // Look up the pending session for this user — no client-supplied session ID needed
    const pending = pendingPaymentStore.get(userPayload.id);
    if (!pending || Date.now() > pending.expiresAt) {
      res.status(404).json({ error: "No pending payment found. If you were charged, please contact support." });
      return;
    }
    const { sessionId } = pending;

    const user = await db.query.askimateUsers.findFirst({
      where: eq(askimateUsers.id, userPayload.id),
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Idempotency: if this session was already processed, return current state
    if (user.stripeSessionId === sessionId) {
      pendingPaymentStore.delete(userPayload.id);
      console.log(`[ASKIMATE-AUTH] Session ${sessionId} already processed for user ${user.id}`);
      res.json({
        success: true,
        alreadyProcessed: true,
        plan: user.plan,
        planKey: user.planKey,
        trialEndsAt: user.trialEndsAt,
      });
      return;
    }

    // Retrieve and validate the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      res.status(402).json({ error: "Payment not completed" });
      return;
    }

    // Defence-in-depth ownership check (session was stored per-user, so this should always pass)
    const sessionOwnerIdStr = session.client_reference_id ?? session.metadata?.userId;
    if (!sessionOwnerIdStr || String(userPayload.id) !== String(sessionOwnerIdStr)) {
      console.warn(
        `[ASKIMATE-AUTH] Ownership mismatch in confirm-pending-payment — session ${sessionId} ` +
        `belongs to userId ${sessionOwnerIdStr}, but caller is userId ${userPayload.id}`,
      );
      res.status(403).json({ error: "Payment session ownership mismatch" });
      return;
    }

    const planKey = (session.metadata?.planKey as string) || "monthly";
    if (!PLAN_DURATION_DAYS[planKey]) {
      res.status(400).json({ error: "Unknown plan in session metadata" });
      return;
    }

    const now = new Date();
    const currentExpiry = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const baseDate = currentExpiry && currentExpiry > now ? currentExpiry : now;
    const planExpiresAt = new Date(baseDate.getTime() + PLAN_DURATION_DAYS[planKey] * 24 * 60 * 60 * 1000);

    const [updatedUser] = await db
      .update(askimateUsers)
      .set({
        plan: "premium",
        planKey,
        trialStartedAt: user.trialStartedAt ?? now,
        trialEndsAt: planExpiresAt,
        stripeSessionId: sessionId,
        updatedAt: now,
      })
      .where(eq(askimateUsers.id, user.id))
      .returning();

    // Clean up the pending entry now that the session has been processed
    pendingPaymentStore.delete(userPayload.id);

    console.log(`[ASKIMATE-AUTH] Premium confirmed (pending) — user ${user.id}, plan ${planKey}, expires ${planExpiresAt.toISOString()}`);

    res.json({
      success: true,
      plan: updatedUser.plan,
      planKey: updatedUser.planKey,
      trialEndsAt: updatedUser.trialEndsAt,
    });
  } catch (error) {
    console.error("[ASKIMATE-AUTH] Confirm pending payment error:", error);
    res.status(500).json({ error: "Failed to confirm payment" });
  }
});

export default router;
