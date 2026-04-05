import { buildEmailHtml, buildEmailText } from "./_base";
import type { EmailTemplate } from "../emailTypes";

export interface AdminNotificationPayload {
  event: string;
  userName?: string;
  userEmail?: string;
  preview?: string;
  adminLink?: string;
}

export function buildAdminNotification(payload: AdminNotificationPayload): EmailTemplate {
  const { event, userName, userEmail, preview, adminLink } = payload;

  const userLine = [userName, userEmail].filter(Boolean).join(" — ");

  const bodyHtml = `
    <p style="margin:0 0 12px"><strong>Event:</strong> ${event}</p>
    ${userLine ? `<p style="margin:0 0 12px"><strong>User:</strong> ${userLine}</p>` : ""}
    ${preview ? `
    <div style="background:#f5f3fb;border-left:3px solid #42147d;border-radius:4px;padding:12px 16px;margin:0 0 16px">
      <p style="margin:0;color:#333;font-size:14px;line-height:1.5">${preview}</p>
    </div>` : ""}
    ${adminLink ? `<p style="margin:0"><a href="${adminLink}" style="color:#42147d;font-weight:600;text-decoration:none">→ Open in Admin Panel</a></p>` : ""}
  `.trim();

  const bodyText = [
    `Event: ${event}`,
    userLine ? `User: ${userLine}` : "",
    preview ? `Message: ${preview}` : "",
    adminLink ? `Admin link: ${adminLink}` : "",
  ].filter(Boolean).join("\n");

  return {
    subject: `[AskiMate Admin] ${event}`,
    html: buildEmailHtml(`Admin Alert: ${event}`, bodyHtml),
    text: buildEmailText(`Admin Alert: ${event}`, bodyText),
    sender: "noreply",
  };
}
