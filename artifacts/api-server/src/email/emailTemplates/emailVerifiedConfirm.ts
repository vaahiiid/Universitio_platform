import type { EmailTemplate, EmailTemplateBuilder, EmailVerifiedPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildEmailVerifiedConfirm: EmailTemplateBuilder<EmailVerifiedPayload> = (payload) => {
  const heading = `Your email is now verified`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your email address has been successfully verified. Your AskiMate account is now fully active
       and you have access to all features.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Go to AskiMate
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      If you have any questions, reply to this email and we'll be happy to help.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour email address has been successfully verified. Your AskiMate account is now fully active.\n\nGo to AskiMate: https://universitio.com/askimate-dashboard\n\nIf you need help, reply to this email.`;

  return {
    subject: `Your email is now verified — AskiMate`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
