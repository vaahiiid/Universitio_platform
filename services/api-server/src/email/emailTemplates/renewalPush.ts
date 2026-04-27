import type { EmailTemplate, EmailTemplateBuilder, RenewalPushPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildRenewalPush: EmailTemplateBuilder<RenewalPushPayload> = (payload) => {
  const heading = `Your AskiMate journey doesn't have to stop here`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>It's been a few days since your <strong>${payload.planName}</strong> plan expired on
       <strong>${payload.expiresAt}</strong>. We wanted to check in and let you know
       that renewing is simple and your progress is waiting for you.</p>
    <p style="color:#555;font-size:14px;line-height:1.7">
      All your conversations with AskiMate are still on file. Renewing picks up exactly where
      you left off — no need to start over. AskiMate by Universitio will be ready to support
      you the moment you're back.
    </p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Renew Now
      </a>
    </p>
    <p style="color:#aaa;font-size:13px;margin-top:28px;line-height:1.6">
      Not ready yet? That's completely fine. Your account will stay on the free plan and your
      history will be here whenever you come back.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nIt's been a few days since your ${payload.planName} plan expired on ${payload.expiresAt}. Your conversations and history are still safe — renewing picks up right where you left off.\n\nRenew at https://universitio.com/askimate-dashboard\n\nNot ready yet? That's fine — your account and history will be here when you return.`;

  return {
    subject: `Your AskiMate history is waiting — renew whenever you're ready`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
