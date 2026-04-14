import type { EmailTemplate, EmailTemplateBuilder, ConsultationConfirmationPayload } from "../emailTypes";
import { buildUniversitioEmailHtml, buildUniversitioEmailText } from "./_base";

export const buildConsultationConfirmation: EmailTemplateBuilder<ConsultationConfirmationPayload> = (payload) => {
  const heading = `Your consultation request has been received`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for booking a consultation with Universitio. We have received your request and our team will review your details shortly.</p>
    <p>Please keep an eye on your inbox — we will contact you with the next steps as soon as possible.</p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/free-consultation"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Visit Our Website
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      If you have any questions in the meantime, feel free to reply to this email and our team will be happy to help.
    </p>
  `.trim();

  const bodyText = [
    `Hi ${payload.firstName},`,
    ``,
    `Thank you for booking a consultation with Universitio. We have received your request and our team will review your details shortly.`,
    ``,
    `Please keep an eye on your inbox — we will contact you with the next steps as soon as possible.`,
    ``,
    `If you have any questions in the meantime, feel free to reply to this email.`,
  ].join("\n");

  return {
    subject: `Your consultation request has been received`,
    html: buildUniversitioEmailHtml(heading, bodyHtml),
    text: buildUniversitioEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
