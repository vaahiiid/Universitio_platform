import type { EmailTemplate, EmailTemplateBuilder, UsageLimitReachedPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildUsageLimitReached: EmailTemplateBuilder<UsageLimitReachedPayload> = (payload) => {
  const heading = `You've reached your weekly question limit`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>You've used your ${payload.limitDescription} on the <strong>${payload.planName}</strong> plan
       for this week. Your limit will reset next week, but if you'd like to keep the conversation
       going now, upgrading to Premium gives you unlimited access.</p>
    <p style="color:#555;font-size:14px;line-height:1.7">
      With a Premium plan, you can ask as many questions as you need — and AskiMate will be there
      to guide you through every part of your journey, without interruption.
    </p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Upgrade to Premium
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      Questions about your plan? Reply to this email — Universitio and AskiMate are here to help.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYou've used your ${payload.limitDescription} on the ${payload.planName} plan for this week. Your limit resets next week, or you can upgrade to Premium for unlimited access.\n\nUpgrade at https://universitio.com/askimate-dashboard\n\nQuestions? Reply to this email — we're here to help.`;

  return {
    subject: `You've reached your AskiMate question limit this week`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
