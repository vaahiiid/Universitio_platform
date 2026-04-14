import type { EmailTemplate, EmailTemplateBuilder, ContactConfirmationPayload } from "../emailTypes";
import { buildUniversitioEmailHtml, buildUniversitioEmailText } from "./_base";

export const buildContactConfirmation: EmailTemplateBuilder<ContactConfirmationPayload> = (payload) => {
  const heading = `We have received your message`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for contacting Universitio. We have received your message and, if a reply is needed, our team will get back to you within a maximum of <strong>1 working day</strong>.</p>
    <p>In the meantime, you can explore our services or start a conversation with AskiMate AI for instant guidance on studying in the UK.</p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Try AskiMate AI
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      If your enquiry is urgent, please reply to this email and our team will prioritise your message.
    </p>
  `.trim();

  const bodyText = [
    `Hi ${payload.firstName},`,
    ``,
    `Thank you for contacting Universitio. We have received your message and, if a reply is needed, our team will get back to you within a maximum of 1 working day.`,
    ``,
    `In the meantime, you can try AskiMate AI for instant guidance: https://universitio.com/askimate`,
    ``,
    `If your enquiry is urgent, please reply to this email.`,
  ].join("\n");

  return {
    subject: `We have received your message`,
    html: buildUniversitioEmailHtml(heading, bodyHtml),
    text: buildUniversitioEmailText(heading, bodyText),
    sender: "universitio-info",
  } satisfies EmailTemplate;
};
