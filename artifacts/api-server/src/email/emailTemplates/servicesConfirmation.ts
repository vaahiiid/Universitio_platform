import type { EmailTemplate, EmailTemplateBuilder, ServicesConfirmationPayload } from "../emailTypes";
import { buildUniversitioEmailHtml, buildUniversitioEmailText } from "./_base";

export const buildServicesConfirmation: EmailTemplateBuilder<ServicesConfirmationPayload> = (payload) => {
  const heading = `Your service enquiry has been received`;

  const serviceLabel = payload.serviceType
    ? `your enquiry regarding <strong>${payload.serviceType}</strong>`
    : `your service enquiry`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for reaching out. We have received ${serviceLabel} and our team will review your request shortly.</p>
    <p>Please keep an eye on your inbox for the next steps. We aim to follow up within <strong>1 working day</strong>.</p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/free-consultation"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Book a Free Consultation
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      If you have any questions in the meantime, please reply to this email and our team will assist you.
    </p>
  `.trim();

  const bodyText = [
    `Hi ${payload.firstName},`,
    ``,
    `Thank you for reaching out. We have received your service enquiry${payload.serviceType ? ` regarding ${payload.serviceType}` : ``} and our team will review your request shortly.`,
    ``,
    `Please keep an eye on your inbox for the next steps. We aim to follow up within 1 working day.`,
    ``,
    `If you have any questions in the meantime, please reply to this email.`,
    ``,
    `Or book a free consultation: https://universitio.com/free-consultation`,
  ].join("\n");

  return {
    subject: `Your service enquiry has been received`,
    html: buildUniversitioEmailHtml(heading, bodyHtml),
    text: buildUniversitioEmailText(heading, bodyText),
    sender: "universitio-info",
  } satisfies EmailTemplate;
};
