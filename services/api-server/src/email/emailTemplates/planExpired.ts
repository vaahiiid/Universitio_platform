import type { EmailTemplate, EmailTemplateBuilder, PlanExpiredPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPlanExpired: EmailTemplateBuilder<PlanExpiredPayload> = (payload) => {
  const heading = `Your AskiMate premium access has ended`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your <strong>${payload.planName}</strong> plan has now expired. Your account is still active
       on the free plan, so you haven't lost access to AskiMate — you'll just have reduced
       weekly questions and some premium features will be paused.</p>
    <p style="color:#555;font-size:14px;line-height:1.7">
      All your conversations and mentoring history are safe. Renewing at any time will restore your
      full premium access immediately — right where you left off.
    </p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Renew My Plan
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      Questions or unsure about which plan suits you? Reply to this email — Universitio
      and AskiMate are here whenever you need us.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour ${payload.planName} plan has expired. Your account is still active on the free plan — all your conversations and history are safe.\n\nRenew at any time to restore full premium access: https://universitio.com/askimate-dashboard\n\nQuestions? Reply to this email — we're here to help.`;

  return {
    subject: `Your AskiMate premium plan has expired`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
