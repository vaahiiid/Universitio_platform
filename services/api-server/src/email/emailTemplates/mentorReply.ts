import type { EmailTemplate, EmailTemplateBuilder, MentorReplyPayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildMentorReply: EmailTemplateBuilder<MentorReplyPayload> = (payload) => {
  const heading = `You have a new message from your mentor`;

  const mentorLine = payload.mentorName
    ? `<strong>${payload.mentorName}</strong> from the Universitio team`
    : `your mentor at Universitio`;

  const previewBlock = payload.messagePreview
    ? `<blockquote style="margin:18px 0;padding:14px 18px;background:#f9f8fc;
                          border-left:4px solid #42147d;border-radius:0 6px 6px 0;
                          color:#555;font-size:14px;line-height:1.7;font-style:italic">
        "${payload.messagePreview}"
       </blockquote>`
    : "";

  const dashboardUrl = `https://universitio.com/askimate-dashboard`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>You have received a new message from ${mentorLine} on AskiMate.</p>
    ${previewBlock}
    <p style="margin-top:28px">
      <a href="${dashboardUrl}"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        View Message
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      Log in to your AskiMate dashboard to read and respond to your mentor.
      If you have any issues accessing your account, reply to this email and we will help.
    </p>
  `.trim();

  const previewText = payload.messagePreview ? `"${payload.messagePreview}"\n\n` : "";
  const bodyText = [
    `Hi ${payload.firstName},`,
    ``,
    `You have received a new message from ${payload.mentorName ?? "your mentor"} on AskiMate.`,
    ``,
    previewText,
    `Click here to view and respond: ${dashboardUrl}`,
    ``,
    `If you have any issues accessing your account, reply to this email.`,
  ].join("\n");

  return {
    subject: `You have a new message from your mentor`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
