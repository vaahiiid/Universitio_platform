import type { EmailTemplate, EmailTemplateBuilder, ExpiryReminderPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

const urgencyLabel: Record<1 | 3 | 5, string> = {
  5: "5 days",
  3: "3 days",
  1: "tomorrow",
};

const urgencyColour: Record<1 | 3 | 5, string> = {
  5: "#42147d",
  3: "#6d28d9",
  1: "#b91c1c",
};

const urgencyNote: Record<1 | 3 | 5, string> = {
  5: "You still have time — renewing now takes just a minute.",
  3: "Renewing now ensures your conversations and progress stay uninterrupted.",
  1: "Act today to keep your mentoring access without any gap.",
};

export const buildExpiryReminder: EmailTemplateBuilder<ExpiryReminderPayload> = (payload) => {
  const label  = urgencyLabel[payload.daysLeft];
  const colour = urgencyColour[payload.daysLeft];
  const note   = urgencyNote[payload.daysLeft];
  const heading = `Your AskiMate access expires ${label}`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Just a heads-up — your <strong>${payload.planName}</strong> plan expires on
       <strong>${payload.expiresAt}</strong>, which is <strong>${label}</strong> from now.</p>
    <p style="color:#555;font-size:14px;line-height:1.7">
      ${note} Renewing keeps all your conversations and mentoring history intact
      so you can pick up exactly where you left off.
    </p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:${colour};color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Renew My Plan
      </a>
    </p>
    <p style="color:#aaa;font-size:13px;margin-top:28px;line-height:1.6">
      Not planning to renew? No action needed — your access will end on ${payload.expiresAt}
      and your account will move to the free plan automatically.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour ${payload.planName} plan expires on ${payload.expiresAt} — ${label} from now.\n\n${note}\n\nRenew at https://universitio.com/askimate-dashboard\n\nNot renewing? No action needed — access ends on ${payload.expiresAt}.`;

  return {
    subject: `Your AskiMate plan expires ${label} — renew to keep access`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
