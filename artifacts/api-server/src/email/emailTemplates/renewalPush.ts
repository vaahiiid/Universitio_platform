import type { EmailTemplate, EmailTemplateBuilder, RenewalPushPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildRenewalPush: EmailTemplateBuilder<RenewalPushPayload> = (payload) => {
  const heading = `Keep your AskiMate momentum going`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your <strong>${payload.planName}</strong> plan is due to expire on 
       <strong>${payload.expiresAt}</strong>. 
       Don't lose the progress you've made with your mentors.</p>
    <p>Renewing keeps all your conversations intact and ensures you continue to get the guidance you need.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Renew Now
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      Not ready to renew? Your account and conversation history will remain on file if you decide to come back.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour ${payload.planName} plan expires on ${payload.expiresAt}. Renew to keep your mentoring conversations going.\n\nRenew at https://universitio.com/askimate\n\nNot ready? Your history will remain on file.`;

  return {
    subject: `Your AskiMate plan is due for renewal — don't lose your progress`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
