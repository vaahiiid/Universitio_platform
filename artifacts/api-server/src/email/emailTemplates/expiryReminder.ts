import type { EmailTemplate, EmailTemplateBuilder, ExpiryReminderPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

const urgencyLabel: Record<1 | 3 | 5, string> = {
  5: "5 days",
  3: "3 days",
  1: "tomorrow",
};

const urgencyColour: Record<1 | 3 | 5, string> = {
  5: "#42147d",
  3: "#7c3aed",
  1: "#b91c1c",
};

export const buildExpiryReminder: EmailTemplateBuilder<ExpiryReminderPayload> = (payload) => {
  const label = urgencyLabel[payload.daysLeft];
  const colour = urgencyColour[payload.daysLeft];
  const heading = `Your ${payload.planName} access expires ${label}`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your <strong>${payload.planName}</strong> plan on AskiMate expires on 
       <strong>${payload.expiresAt}</strong> — that's <strong>${label}</strong> from now.</p>
    <p>To keep uninterrupted access to your mentors and conversations, renew your plan before it expires.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:${colour};color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Renew Now
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      If you don't wish to renew, no action is needed — your access will simply end on ${payload.expiresAt}.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour ${payload.planName} plan on AskiMate expires on ${payload.expiresAt} — ${label} from now.\n\nRenew at https://universitio.com/askimate to keep access.\n\nIf you don't wish to renew, no action is needed.`;

  return {
    subject: `Your AskiMate plan expires ${label} — renew to keep access`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
