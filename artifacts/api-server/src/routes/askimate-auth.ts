import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db, pool } from "@workspace/db";
import { askimateUsers } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "askimate-jwt-secret-2026";
const JWT_EXPIRES_IN = "7d";

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

    // Create user with 3-day trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 3);

    const [newUser] = await db
      .insert(askimateUsers)
      .values({
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        plan: "premium",
        trialEndsAt,
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

export default router;
