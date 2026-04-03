import type { EmailTemplate, EmailTemplateBuilder, EmailVerificationPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildEmailVerification: EmailTemplateBuilder<EmailVerificationPayload> = (payload) => {
  const hours = payload.expiryHours ?? 24;
  const heading = `Verify your email address`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>To finish setting up your AskiMate account, please confirm your email address.
       This keeps your account secure and ensures you receive important updates from us.</p>
    <p style="color:#666;font-size:14px">
      This link expires in <strong>${hours} hour${hours !== 1 ? "s" : ""}</strong>.
    </p>
    <p style="margin-top:28px">
      <a href="${payload.verificationLink}"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Verify My Email
      </a>
    </p>
    <p style="color:#999;font-size:13px;margin-top:28px;line-height:1.6">
      Didn't create an AskiMate account? You can safely ignore this email — nothing will happen.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nTo finish setting up your AskiMate account, please confirm your email address. This link expires in ${hours} hour${hours !== 1 ? "s" : ""}.\n\nVerify here: ${payload.verificationLink}\n\nDidn't create an account? You can safely ignore this email.`;

  return {
    subject: `Verify your email to activate your AskiMate account`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
