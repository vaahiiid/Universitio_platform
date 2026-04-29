import type { EmailTemplate, EmailTemplateBuilder, PasswordResetPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPasswordReset: EmailTemplateBuilder<PasswordResetPayload> = (payload) => {
  const minutes = payload.expiryMinutes ?? 60;
  const heading = `Reset your Universitio password`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>We received a request to reset the password for your Universitio account.
       Click the button below to choose a new password.</p>
    <p style="color:#666;font-size:14px">
      This link expires in <strong>${minutes} minute${minutes !== 1 ? "s" : ""}</strong>.
      If you did not request a password reset, you can safely ignore this email — your password will not change.
    </p>
    <p style="margin-top:28px">
      <a href="${payload.resetLink}"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Reset Password
      </a>
    </p>
    <p style="color:#999;font-size:13px;margin-top:28px;line-height:1.6">
      For security, this link is single-use and expires after ${minutes} minutes.<br>
      If you need help, contact us at <a href="mailto:info@universitio.com" style="color:#42147d">info@universitio.com</a>.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nWe received a request to reset the password for your Universitio account.\n\nClick the link below to reset your password (expires in ${minutes} minutes):\n\n${payload.resetLink}\n\nIf you did not request a password reset, you can safely ignore this email.`;

  return {
    subject: `Reset your Universitio password`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "universitio-noreply",
  } satisfies EmailTemplate;
};
