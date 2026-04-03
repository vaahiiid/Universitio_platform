import type { EmailTemplate, EmailTemplateBuilder, ReEngagementPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildReEngagement: EmailTemplateBuilder<ReEngagementPayload> = (payload) => {
  const heading = `We've missed you, ${payload.firstName}`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>It's been a while since we've seen you on AskiMate. We just wanted to check in and let you know
       your mentor is still here whenever you're ready.</p>
    <p>Whether you have a question about your university application, need guidance on personal statements,
       or simply want to talk through your options — we're here to help.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Continue Your Journey
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px;line-height:1.5">
      If you have any questions or need support, simply reply to this email and we'll
      be happy to help.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nIt's been a while since we've seen you on AskiMate. We just wanted to check in — your mentor is still here whenever you're ready.\n\nContinue your journey: https://universitio.com/askimate\n\nIf you need support, reply to this email.`;

  return {
    subject: `We've missed you — your AskiMate mentor is here when you're ready`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
