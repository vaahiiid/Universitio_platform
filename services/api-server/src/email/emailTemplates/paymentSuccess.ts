import type { EmailTemplate, EmailTemplateBuilder, PaymentSuccessPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildPaymentSuccess: EmailTemplateBuilder<PaymentSuccessPayload> = (payload) => {
  const heading = `You're all set, ${payload.firstName} — premium access confirmed.`;

  const referenceRow = payload.reference
    ? `
      <tr>
        <td style="color:#7c6fa0;font-size:13px;padding:8px 0;
                   border-top:1px solid #ede8f5">Payment reference</td>
        <td style="color:#888;font-size:13px;text-align:right;padding:8px 0;
                   border-top:1px solid #ede8f5;font-family:monospace">
          ${payload.reference}
        </td>
      </tr>`
    : "";

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Your payment has been processed successfully. Your <strong>${payload.planName}</strong>
       plan is now active — AskiMate is ready to support you with full premium access.</p>

    <table cellpadding="0" cellspacing="0" role="presentation"
           style="width:100%;background:#f9f8fc;border-radius:8px;
                  padding:20px 24px;margin:24px 0;border:1px solid #ede8f5">
      <tr>
        <td colspan="2"
            style="color:#42147d;font-size:11px;font-weight:700;letter-spacing:0.8px;
                   text-transform:uppercase;padding-bottom:12px">
          Purchase summary
        </td>
      </tr>
      <tr>
        <td style="color:#666;font-size:14px;padding:6px 0">Plan</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;
                   text-align:right;padding:6px 0">${payload.planName}</td>
      </tr>
      <tr>
        <td style="color:#666;font-size:14px;padding:6px 0">Amount charged</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;
                   text-align:right;padding:6px 0">${payload.amount}</td>
      </tr>
      <tr>
        <td style="color:#666;font-size:14px;padding:6px 0">Access until</td>
        <td style="color:#1a1a1a;font-size:14px;font-weight:600;
                   text-align:right;padding:6px 0">${payload.expiresAt}</td>
      </tr>
      ${referenceRow}
    </table>

    <p style="color:#555;font-size:14px;line-height:1.7">
      You now have unlimited access to AskiMate's mentoring features. Start or continue a conversation
      with your mentor — we're ready when you are.
    </p>

    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Open AskiMate
      </a>
    </p>

    <p style="color:#aaa;font-size:12px;margin-top:28px;line-height:1.6">
      Please keep this email as your receipt. If you have any questions about your
      purchase, simply reply and we'll be happy to help.
    </p>
  `.trim();

  const refLine = payload.reference ? `\nPayment reference: ${payload.reference}` : "";
  const bodyText = `Hi ${payload.firstName},\n\nYour payment has been processed successfully. Your ${payload.planName} plan is now active.\n\nPurchase summary:\n  Plan: ${payload.planName}\n  Amount: ${payload.amount}\n  Access until: ${payload.expiresAt}${refLine}\n\nOpen AskiMate: https://universitio.com/askimate-dashboard\n\nPlease keep this email as your receipt. For questions, reply to this email.`;

  return {
    subject: `Payment confirmed — your AskiMate ${payload.planName} plan is active`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "noreply",
  } satisfies EmailTemplate;
};
