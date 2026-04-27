import type { EmailTemplate, EmailTemplateBuilder, EmailVerifiedPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildEmailVerifiedConfirm: EmailTemplateBuilder<EmailVerifiedPayload> = (payload) => {
  const heading = `You're verified — welcome aboard.`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your email address has been confirmed and your AskiMate account is now fully active.</p>
    <p>You now have AskiMate by your side — Universitio's smart study companion, ready to support you
       with guidance, mentoring, and expert advice whenever you need it.</p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Go to AskiMate
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      Questions? Reply to this email — Universitio and AskiMate are here to help.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour email address has been confirmed and your AskiMate account is now fully active.\n\nYou now have AskiMate by your side — Universitio's smart study companion, ready whenever you need it.\n\nGo to AskiMate: https://universitio.com/askimate-dashboard\n\nQuestions? Reply to this email — we're here to help.`;

  return {
    subject: `You're verified — your AskiMate account is ready`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
