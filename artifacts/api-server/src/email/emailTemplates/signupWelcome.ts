import type { EmailTemplate, EmailTemplateBuilder, SignupWelcomePayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildSignupWelcome: EmailTemplateBuilder<SignupWelcomePayload> = (payload) => {
  const heading = `Welcome to AskiMate, ${payload.firstName}!`;

  const bodyHtml = `
    <p>You've successfully created your AskiMate account. We're glad to have you.</p>
    <p>AskiMate connects you with expert mentors who can help guide your journey — whether you're planning to study abroad, 
       choosing the right university, or navigating the application process.</p>
    <p style="margin-top:24px">
      <a href="https://universitio.com/askimate"
         style="background:#42147d;color:#fff;padding:12px 24px;border-radius:6px;
                text-decoration:none;font-weight:600;display:inline-block">
        Open AskiMate
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:24px">
      If you have any questions, reply to this email and we'll be happy to help.
    </p>
  `.trim();

  const bodyText = `You've successfully created your AskiMate account. We're glad to have you.\n\nOpen AskiMate at https://universitio.com/askimate\n\nIf you have any questions, reply to this email and we'll be happy to help.`;

  return {
    subject: `Welcome to AskiMate, ${payload.firstName}!`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
