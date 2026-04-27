import { Router, type IRouter, type Request, type Response } from "express";
import { verifyCredentials, generateToken, requireAdmin } from "../middleware/auth";

const router: IRouter = Router();

router.post("/admin/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (!verifyCredentials(email, password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateToken({ email });
  res.json({ token, email });
});

router.get("/admin/auth/me", requireAdmin, (req: Request, res: Response) => {
  res.json({ email: req.admin!.email });
});

export default router;
