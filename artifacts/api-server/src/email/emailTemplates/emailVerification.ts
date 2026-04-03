import type { EmailTemplate, EmailTemplateBuilder, EmailVerificationPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildEmailVerification: EmailTemplateBuilder<EmailVerificationPayload> = (payload) => {
  const hours = payload.expiryHours ?? 24;
  const heading = `Verify your email address`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Please verify your email address to activate your AskiMate account. 
       This link will expire in <strong>${hours} hour${hours !== 1 ? "s" : ""}</strong>.</p>
    <p style="margin-top:24px">
      <a href="${payload.verificationLink}"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Verify Email Address
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      If you did not create an AskiMate account, you can safely ignore this email.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nPlease verify your email address to activate your AskiMate account.\nThis link will expire in ${hours} hour${hours !== 1 ? "s" : ""}.\n\nVerify here: ${payload.verificationLink}\n\nIf you did not create an account, you can safely ignore this email.`;

  return {
    subject: `Verify your AskiMate email address`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
