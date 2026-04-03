import { sendEmail, type SendEmailResult } from "../services/emailService";
import { EmailType, type EmailType as EmailTypeValue, type EmailPayloadMap } from "./emailTypes";
import { templateRegistry } from "./emailTemplates/index";

export { EmailType };

/**
 * Send a transactional email by type.
 *
 * All email sending logic in routes/controllers should call this function — never
 * construct email content or call sendEmail() directly from business logic.
 *
 * This function is fully fail-safe:
 * - Template build errors are caught and logged; they return {success: false} without throwing.
 * - Resend errors are handled inside sendEmail() and also return {success: false}.
 * - Callers should use .catch() if calling fire-and-forget.
 *
 * @param type    - One of the EmailType constants (e.g. EmailType.PAYMENT_SUCCESS)
 * @param to      - Recipient email address
 * @param payload - Typed payload matching the email type (enforced by EmailPayloadMap)
 */
export async function sendTransactionalEmail<T extends EmailTypeValue>(
  type: T,
  to: string,
  payload: EmailPayloadMap[T],
): Promise<SendEmailResult> {
  // ── Build template ────────────────────────────────────────────────────────
  let template;
  try {
    const builder = templateRegistry[type] as (p: EmailPayloadMap[T]) => ReturnType<typeof templateRegistry[T]>;
    template = builder(payload);
  } catch (err: any) {
    console.error(`[EMAIL] Template build failed for "${type}" → ${to}:`, err?.message || err);
    return { success: false, error: `Template build failed: ${err?.message ?? "unknown error"}` };
  }

  // ── Send ──────────────────────────────────────────────────────────────────
  console.log(`[EMAIL] Sending "${type}" → ${to}`);

  const result = await sendEmail({
    to,
    subject: template.subject,
    html:    template.html,
    text:    template.text,
    sender:  template.sender,
  });

  if (!result.success) {
    console.error(`[EMAIL] Failed to send "${type}" → ${to}: ${result.error}`);
  }

  return result;
}
