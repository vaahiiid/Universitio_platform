import type { EmailTemplate, EmailTemplateBuilder, PaymentFailedPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPaymentFailed: EmailTemplateBuilder<PaymentFailedPayload> = (payload) => {
  const heading = `We weren't able to process your payment`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Unfortunately, your payment of <strong>${payload.amount}</strong> for the
       <strong>${payload.planName}</strong> plan didn't go through. Don't worry —
       your account has not been charged.</p>
    <p style="color:#555;font-size:14px;line-height:1.7">
      This can happen if a card was declined, a payment session timed out, or there was a
      temporary issue with your bank. These things are usually straightforward to resolve.
    </p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Try Again
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      If you continue to have difficulties, reply to this email and we'll help you sort it out.
      Universitio and AskiMate are here to support you every step of the way.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour payment of ${payload.amount} for the ${payload.planName} plan didn't go through. Your account has not been charged.\n\nPlease try again at https://universitio.com/askimate-dashboard\n\nIf you need help, reply to this email — we're here to sort it out.`;

  return {
    subject: `Action needed — your AskiMate payment didn't go through`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
