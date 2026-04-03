import type { EmailTemplate, EmailTemplateBuilder, UsageLimitReachedPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildUsageLimitReached: EmailTemplateBuilder<UsageLimitReachedPayload> = (payload) => {
  const heading = `You've reached your ${payload.planName} limit`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>You've used up your ${payload.limitDescription} on the <strong>${payload.planName}</strong> plan. 
       You won't be able to send more until your limit resets or you upgrade your plan.</p>
    <p>Upgrading gives you more access to mentors and removes or increases these limits.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Upgrade My Plan
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      If you have any questions about your plan, reply to this email and we'll be happy to help.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYou've used up your ${payload.limitDescription} on the ${payload.planName} plan.\n\nUpgrade at https://universitio.com/askimate to get more access.\n\nIf you have questions, reply to this email.`;

  return {
    subject: `You've reached your AskiMate ${payload.planName} limit`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
