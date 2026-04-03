import type { EmailTemplate, EmailTemplateBuilder, PaymentFailedPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPaymentFailed: EmailTemplateBuilder<PaymentFailedPayload> = (payload) => {
  const heading = `Your payment could not be processed`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Unfortunately, your payment of <strong>${payload.amount}</strong> for the 
       <strong>${payload.planName}</strong> plan could not be completed.</p>
    <p>This can happen if your card was declined, the payment session expired, or there was a temporary issue 
       with your payment method. Your account has not been charged.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Try Again
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      If you continue to experience issues, please reply to this email and we'll help you sort it out.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour payment of ${payload.amount} for the ${payload.planName} plan could not be completed. Your account has not been charged.\n\nPlease try again at https://universitio.com/askimate\n\nIf you need help, reply to this email.`;

  return {
    subject: `Action needed — your AskiMate payment did not go through`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
