import { Router, type IRouter } from "express";
import { verifyCredentials, generateToken, requireAdmin } from "../middleware/auth";

const router: IRouter = Router();

router.post("/admin/auth/login", (req, res) => {
  const { email, password } = req.body;
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

router.get("/admin/auth/me", requireAdmin, (req, res) => {
  res.json({ email: (req as any).admin.email });
});

export default router;
