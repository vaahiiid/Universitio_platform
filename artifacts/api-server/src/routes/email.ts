import { Router, type IRouter, type Request, type Response } from "express";
import { sendTemplateEmail } from "../services/emailService";

const router: IRouter = Router();

/**
 * Internal test endpoint — sends a test email to a specified address.
 * Requires the admin token in the Authorization header.
 * Usage: POST /api/email/test  { "to": "you@example.com" }
 */
router.post("/email/test", async (req: Request, res: Response) => {
  const adminToken = process.env.ADMIN_TOKEN || process.env.JWT_SECRET || "";
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ") || authHeader.slice(7) !== adminToken) {
    res.status(401).json({ error: "Unauthorised" });
    return;
  }

  const { to } = req.body as { to?: string };
  if (!to || !to.includes("@")) {
    res.status(400).json({ error: "A valid 'to' email address is required" });
    return;
  }

  const result = await sendTemplateEmail({
    to,
    subject: "AskiMate email infrastructure test",
    heading: "Email infrastructure is working ✓",
    body: `
      <p>This is a test email confirming that AskiMate's transactional email system is correctly configured.</p>
      <p><strong>Sent via:</strong> Resend<br>
         <strong>Sender domain:</strong> universitio.com<br>
         <strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
    `,
  });

  if (result.success) {
    res.json({ success: true, id: result.id, message: `Test email sent to ${to}` });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

export default router;
