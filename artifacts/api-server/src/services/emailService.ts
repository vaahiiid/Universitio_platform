import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

if (!RESEND_API_KEY) {
  console.warn("[EMAIL] WARNING: RESEND_API_KEY not set — email sending will fail.");
}

const resend = new Resend(RESEND_API_KEY);

/**
 * The two authorised sender addresses for Universitio / AskiMate.
 *
 * "noreply" — system emails that should not invite replies
 *   e.g. email verification, payment confirmations, expiry reminders, limit warnings
 *
 * "info"    — reply-friendly emails where a response makes sense
 *   e.g. welcome messages, support-style communication
 */
const SENDERS = {
  noreply: "AskiMate <noreply@universitio.com>",
  info:    "AskiMate <info@universitio.com>",
} as const;

export type EmailSender = keyof typeof SENDERS;

const REPLY_TO = "vahidmoir@gmail.com";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  sender?: EmailSender;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Central email sender. All transactional emails in the app should go through this function.
 *
 * @param options.sender - "noreply" for system emails, "info" for reply-friendly emails.
 *                         Defaults to "noreply".
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) {
    console.error("[EMAIL] Cannot send email — RESEND_API_KEY is not configured.");
    return { success: false, error: "Email service not configured" };
  }

  const from = SENDERS[options.sender ?? "noreply"];

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.text ? { text: options.text } : {}),
      reply_to: REPLY_TO,
    });

    if (error) {
      console.error("[EMAIL] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL] Sent "${options.subject}" to ${Array.isArray(options.to) ? options.to.join(", ") : options.to} via ${from} — id: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[EMAIL] Unexpected error:", err?.message || err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

/**
 * Convenience wrapper for branded AskiMate template emails.
 *
 * @param opts.sender - "noreply" (default) or "info". See EmailSender type.
 */
export async function sendTemplateEmail(opts: {
  to: string;
  subject: string;
  heading: string;
  body: string;
  sender?: EmailSender;
}): Promise<SendEmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f6f6f6;padding:32px 0;margin:0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px">
        <tr>
          <td style="background:#42147d;padding:24px 32px">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px">AskiMate</span>
            <span style="color:#c4b0e8;font-size:13px;margin-left:8px">by Universitio</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px">${opts.heading}</h2>
            <div style="color:#444;font-size:15px;line-height:1.6">${opts.body}</div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee">
            <p style="margin:0;color:#999;font-size:12px">
              Universitio Ltd &bull; Company No. 15168670 &bull;
              <a href="https://universitio.com" style="color:#42147d;text-decoration:none">universitio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();

  const text = `${opts.heading}\n\n${opts.body.replace(/<[^>]+>/g, "")}\n\n— AskiMate by Universitio\nhttps://universitio.com`;

  return sendEmail({ to: opts.to, subject: opts.subject, html, text, sender: opts.sender });
}
