import type { EmailTemplate, EmailTemplateBuilder, ReferralConfirmationPayload } from "../emailTypes";
import { buildUniversitioEmailHtml, buildUniversitioEmailText } from "./_base";

export const buildReferralConfirmation: EmailTemplateBuilder<ReferralConfirmationPayload> = (payload) => {
  const heading = `Your referral has been received`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for submitting a student referral to Universitio. We have received your details and our team will review the information carefully.</p>
    <p>You will receive an update by email within a maximum of <strong>1 working day</strong>.</p>
    <p style="margin-top:28px">
      <a href="https://universitio.com"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Visit Universitio
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      If you have any questions about your referral, please reply to this email and our team will be happy to help.
    </p>
  `.trim();

  const bodyText = [
    `Hi ${payload.firstName},`,
    ``,
    `Thank you for submitting a student referral to Universitio. We have received your details and our team will review the information carefully.`,
    ``,
    `You will receive an update by email within a maximum of 1 working day.`,
    ``,
    `If you have any questions about your referral, please reply to this email.`,
  ].join("\n");

  return {
    subject: `Your referral has been received`,
    html: buildUniversitioEmailHtml(heading, bodyHtml),
    text: buildUniversitioEmailText(heading, bodyText),
    sender: "universitio-info",
  } satisfies EmailTemplate;
};
