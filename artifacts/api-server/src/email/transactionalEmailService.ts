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
 * @param type    - One of the EmailType constants (e.g. EmailType.PAYMENT_SUCCESS)
 * @param to      - Recipient email address
 * @param payload - Typed payload matching the email type (enforced by EmailPayloadMap)
 *
 * @example
 *   await sendTransactionalEmail(EmailType.PAYMENT_SUCCESS, user.email, {
 *     firstName: user.firstName,
 *     planName: "Monthly",
 *     amount: "£9.99",
 *     expiresAt: "30 Apr 2026",
 *   });
 */
export async function sendTransactionalEmail<T extends EmailTypeValue>(
  type: T,
  to: string,
  payload: EmailPayloadMap[T],
): Promise<SendEmailResult> {
  const builder = templateRegistry[type] as (p: EmailPayloadMap[T]) => ReturnType<typeof templateRegistry[T]>;
  const template = builder(payload);

  return sendEmail({
    to,
    subject: template.subject,
    html:    template.html,
    text:    template.text,
    sender:  template.sender,
  });
}
