import type { EmailTemplate, EmailTemplateBuilder, SignupWelcomePayload } from "../emailTypes";
import { buildEmailHtml, buildEmailText } from "./_base";

export const buildSignupWelcome: EmailTemplateBuilder<SignupWelcomePayload> = (payload) => {
  const heading = `Welcome to AskiMate, ${payload.firstName}.`;

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>You've joined AskiMate — Universitio's smart study companion, built to guide you through
       every step of your educational journey.</p>
    <p>Whether you're exploring universities, preparing your application, or figuring out next steps,
       AskiMate is here to give you the guidance you need — clearly and on your terms.</p>
    <p style="margin-top:28px">
      <a href="https://universitio.com/askimate-dashboard"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Open AskiMate
      </a>
    </p>
    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      If you have any questions, simply reply to this email — we're happy to help.
    </p>
  `.trim();

  const bodyText = `Hi ${payload.firstName},\n\nWelcome to AskiMate — Universitio's smart study companion, built to guide you through every step of your educational journey.\n\nOpen AskiMate: https://universitio.com/askimate-dashboard\n\nIf you have questions, reply to this email — we're happy to help.`;

  return {
    subject: `Welcome to AskiMate, ${payload.firstName} — let's get started`,
    html: buildEmailHtml(heading, bodyHtml),
    text: buildEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
