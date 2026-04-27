import type { EmailTemplate, EmailTemplateBuilder, ReEngagementPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildReEngagement: EmailTemplateBuilder<ReEngagementPayload> = (payload) => {
  const heading = `${payload.firstName}, your AskiMate mentor is still here`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>We noticed you haven't visited AskiMate in a little while, and we just wanted to check in.</p>
    <p style="color:#555;font-size:14px;line-height:1.7">
      Your mentor is still here, ready to help — whether you have questions about your university
      application, need guidance on personal statements, want to talk through your study options,
      or anything in between.
    </p>
    <p style="color:#555;font-size:14px;line-height:1.7">
      AskiMate by Universitio is built to support you through every stage of your journey.
      Whenever you're ready to continue, we'll be right here.
    </p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Continue Your Journey
      </a>
    </p>
    <p style="color:#aaa;font-size:13px;margin-top:28px;line-height:1.6">
      Need help or have a question? Simply reply to this email —
      Universitio and AskiMate are always here to support you.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nWe noticed you haven't visited AskiMate in a little while — we just wanted to check in.\n\nYour mentor is still here, ready to help whenever you need guidance on your university journey.\n\nContinue your journey: https://universitio.com/askimate-dashboard\n\nNeed help? Reply to this email — we're here.`;

  return {
    subject: `${payload.firstName}, your AskiMate mentor is here whenever you're ready`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
