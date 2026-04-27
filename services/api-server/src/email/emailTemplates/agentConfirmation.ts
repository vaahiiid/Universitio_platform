import type { EmailTemplate, EmailTemplateBuilder, AgentConfirmationPayload } from "../emailTypes";
import { buildUniversitioEmailHtml, buildUniversitioEmailText } from "./_base";

export const buildAgentConfirmation: EmailTemplateBuilder<AgentConfirmationPayload> = (payload) => {
  const heading = `Your agent enquiry has been received`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for your interest in working with Universitio. We have received your enquiry and our team will review it carefully.</p>
    <p>You will hear back from us by email within a maximum of <strong>1 working day</strong>.</p>
    <p style="margin-top:28px">
      <a href="https://universitio.com"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Visit Universitio
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      We look forward to the possibility of working together. If you have any immediate questions, please reply to this email.
    </p>
  `.trim();

  const bodyText = [
    `Hi ${payload.firstName},`,
    ``,
    `Thank you for your interest in working with Universitio. We have received your enquiry and our team will review it carefully.`,
    ``,
    `You will hear back from us by email within a maximum of 1 working day.`,
    ``,
    `We look forward to the possibility of working together. If you have any immediate questions, please reply to this email.`,
  ].join("\n");

  return {
    subject: `Your agent enquiry has been received`,
    html: buildUniversitioEmailHtml(heading, bodyHtml),
    text: buildUniversitioEmailText(heading, bodyText),
    sender: "universitio-info",
  } satisfies EmailTemplate;
};
