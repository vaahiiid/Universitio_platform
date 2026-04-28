import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_JWT_SECRET) {
  throw new Error("[AUTH] FATAL: ADMIN_JWT_SECRET environment variable is not set. Refusing to start.");
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error("[AUTH] FATAL: ADMIN_EMAIL and ADMIN_PASSWORD environment variables must be set. Refusing to start.");
}

export interface AdminPayload {
  email: string;
  role: "admin";
}

export function generateToken(payload: Omit<AdminPayload, "role">): string {
  const tokenPayload: AdminPayload = { ...payload, role: "admin" };
  return jwt.sign(tokenPayload, ADMIN_JWT_SECRET!, { expiresIn: "24h" });
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
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET!) as AdminPayload;
    if (decoded.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
