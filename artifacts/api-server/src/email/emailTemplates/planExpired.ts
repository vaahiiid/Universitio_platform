import type { EmailTemplate, EmailTemplateBuilder, PlanExpiredPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPlanExpired: EmailTemplateBuilder<PlanExpiredPayload> = (payload) => {
  const heading = `Your ${payload.planName} plan has expired`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your <strong>${payload.planName}</strong> plan on AskiMate has now expired. 
       You still have access to your account on the free plan, but premium features and 
       mentor messaging are no longer available.</p>
    <p>Renew at any time to restore full access to your conversations and mentors.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Renew My Plan
      </a>
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour ${payload.planName} plan on AskiMate has expired. You still have access to your account on the free plan, but premium features are no longer available.\n\nRenew at https://universitio.com/askimate`;

  return {
    subject: `Your AskiMate plan has expired`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
