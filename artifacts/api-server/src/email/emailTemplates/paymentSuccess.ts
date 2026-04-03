import type { EmailTemplate, EmailTemplateBuilder, PaymentSuccessPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPaymentSuccess: EmailTemplateBuilder<PaymentSuccessPayload> = (payload) => {
  const heading = `Payment confirmed — ${payload.planName} is active`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your payment of <strong>${payload.amount}</strong> was successful. 
       Your <strong>${payload.planName}</strong> plan is now active.</p>
    <table cellpadding="0" cellspacing="0"
           style="width:100%;background:#f9f6ff;border-radius:6px;
                  padding:16px;margin:20px 0;border:1px solid #e5daf7">
      <tr>
        <td style="color:#555;font-size:14px">Plan</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;text-align:right">${payload.planName}</td>
      </tr>
      <tr>
        <td style="color:#555;font-size:14px;padding-top:8px">Amount paid</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;text-align:right;padding-top:8px">${payload.amount}</td>
      </tr>
      <tr>
        <td style="color:#555;font-size:14px;padding-top:8px">Access until</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;text-align:right;padding-top:8px">${payload.expiresAt}</td>
      </tr>
    </table>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Go to AskiMate
      </a>
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nYour payment of ${payload.amount} was successful. Your ${payload.planName} plan is now active until ${payload.expiresAt}.\n\nGo to AskiMate: https://universitio.com/askimate`;

  return {
    subject: `Payment confirmed — ${payload.planName} activated`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
