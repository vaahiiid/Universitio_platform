import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "universitio-admin-secret-key-2026";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@universitio.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Universitio2002@";

if (!process.env.JWT_SECRET) {
  console.warn("[AUTH] WARNING: JWT_SECRET not set — using fallback. Set JWT_SECRET env var for production.");
}
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  console.warn("[AUTH] WARNING: ADMIN_EMAIL / ADMIN_PASSWORD not set — using defaults. Set env vars for production.");
}

export interface AdminPayload {
  email: string;
}

export function generateToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    (req as any).admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
