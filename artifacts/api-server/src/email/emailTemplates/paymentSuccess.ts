import type { EmailTemplate, EmailTemplateBuilder, PaymentSuccessPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPaymentSuccess: EmailTemplateBuilder<PaymentSuccessPayload> = (payload) => {
  const heading = `Purchase confirmed — thank you, ${payload.firstName}`;

  const referenceRow = payload.reference
    ? `
      <tr>
        <td style="color:#555;font-size:13px;padding-top:8px;padding-bottom:8px;
                   border-top:1px solid #e5daf7">Reference</td>
        <td style="color:#888;font-size:13px;text-align:right;padding-top:8px;
                   padding-bottom:8px;border-top:1px solid #e5daf7;font-family:monospace">
          ${payload.reference}
        </td>
      </tr>`
    : "";

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your payment has been successfully processed. Your <strong>${payload.planName}</strong>
       plan is now active and ready to use.</p>

    <table cellpadding="0" cellspacing="0"
           style="width:100%;background:#f9f6ff;border-radius:8px;
                  padding:20px;margin:24px 0;border:1px solid #e5daf7">
      <tr>
        <td colspan="2"
            style="color:#42147d;font-size:11px;font-weight:700;letter-spacing:0.8px;
                   text-transform:uppercase;padding-bottom:12px">
          Purchase summary
        </td>
      </tr>
      <tr>
        <td style="color:#555;font-size:14px;padding:6px 0">Plan</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;text-align:right;padding:6px 0">
          ${payload.planName}
        </td>
      </tr>
      <tr>
        <td style="color:#555;font-size:14px;padding:6px 0">Amount charged</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;text-align:right;padding:6px 0">
          ${payload.amount}
        </td>
      </tr>
      <tr>
        <td style="color:#555;font-size:14px;padding:6px 0">Access until</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;text-align:right;padding:6px 0">
          ${payload.expiresAt}
        </td>
      </tr>
      ${referenceRow}
    </table>

    <p style="color:#555;font-size:14px;line-height:1.6">
      You now have full premium access to AskiMate. Start a conversation with your mentor
      or continue from where you left off.
    </p>

    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Open AskiMate
      </a>
    </p>

    <p style="color:#aaa;font-size:12px;margin-top:24px;line-height:1.5">
      Keep this email as your receipt. If you have any questions about your purchase,
      reply to this email and we'll be happy to help.
    </p>
  `.trim();

  const refLine = payload.reference ? `\nReference: ${payload.reference}` : "";
  const bodyText = `Hi ${payload.firstName},\n\nYour payment has been successfully processed. Your ${payload.planName} plan is now active.\n\nPurchase summary:\n  Plan: ${payload.planName}\n  Amount: ${payload.amount}\n  Access until: ${payload.expiresAt}${refLine}\n\nOpen AskiMate: https://universitio.com/askimate\n\nKeep this email as your receipt. For questions, reply to this email.`;

  return {
    subject: `Your AskiMate purchase is confirmed — ${payload.planName}`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
